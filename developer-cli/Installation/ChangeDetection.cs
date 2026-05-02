using System.Security.Cryptography;
using DeveloperCli.Utilities;
using Spectre.Console;

namespace DeveloperCli.Installation;

public static class ChangeDetection
{
    internal static void EnsureCliIsCompiledWithLatestChanges(bool isDebugBuild)
    {
        if (Configuration.IsWindows)
        {
            // In Windows, the process is renamed to .previous.exe when updating to unblock publishing of new executable
            // We delete the previous executable the next time the process is started
            var previousExePath = Environment.ProcessPath!.Replace(".exe", ".previous.exe");
            if (File.Exists(previousExePath))
            {
                try
                {
                    // First try simple deletion
                    File.Delete(previousExePath);
                }
                catch (UnauthorizedAccessException)
                {
                    // Check command line args to determine behavior
                    var args = Environment.GetCommandLineArgs();
                    var isForceCommand = args.Any(arg => arg.Equals("--force", StringComparison.OrdinalIgnoreCase));
                    var isWatchCommand = args.Any(arg => arg.Equals("watch", StringComparison.OrdinalIgnoreCase));
                    var isStopCommand = args.Any(arg => arg.Equals("--stop", StringComparison.OrdinalIgnoreCase));

                    // For watch command without force, or with stop, skip cleanup (watch command will handle it)
                    if (isWatchCommand && (!isForceCommand || isStopCommand))
                    {
                        return;
                    }

                    // In non-interactive mode or with --force, automatically clean up
                    if (!AnsiConsole.Profile.Capabilities.Interactive || isForceCommand)
                    {
                        TryDeletePreviousExe(previousExePath);
                        return;
                    }

                    // In interactive mode, ask the user
                    AnsiConsole.MarkupLine("[yellow]The previous CLI executable is still running.[/]");
                    if (AnsiConsole.Confirm("Do you want to kill the running process and continue?"))
                    {
                        TryDeletePreviousExe(previousExePath);
                    }
                    else
                    {
                        Environment.Exit(0);
                    }
                }
            }
        }

        var currentHash = CalculateMd5HashForSolution();
        if (currentHash == Configuration.GetConfigurationSetting().Hash) return;

        PublishDeveloperCli(currentHash);

        // When running in debug mode, we want to avoid restarting the process
        if (isDebugBuild) return;

        AnsiConsole.WriteLine();
        AnsiConsole.MarkupLine("[green]The CLI was successfully updated. Please rerun the command.[/]");
        AnsiConsole.WriteLine();
        Environment.Exit(0);
    }

    private static void TryDeletePreviousExe(string previousExePath)
    {
        try
        {
            // Kill processes that have the file locked
            ProcessHelper.StartProcess("""powershell -Command "Get-Process pp.previous -ErrorAction SilentlyContinue | Stop-Process -Force" """, redirectOutput: true, exitOnError: false);
            ProcessHelper.StartProcess($$"""powershell -Command "Get-Process | Where-Object {$_.Path -eq '{{previousExePath}}'} | Stop-Process -Force" """, redirectOutput: true, exitOnError: false);

            Thread.Sleep(1000);

            // Try to delete with retries
            for (var i = 0; i < 3; i++)
            {
                try
                {
                    if (File.Exists(previousExePath))
                    {
                        File.SetAttributes(previousExePath, FileAttributes.Normal);
                        File.Delete(previousExePath);
                    }

                    return;
                }
                catch
                {
                    if (i < 2)
                    {
                        Thread.Sleep(500);
                    }
                }
            }
        }
        catch
        {
            // Ignore - file will be cleaned up next time
        }
    }

    private static FileStream WaitForBuildLock(string lockFilePath)
    {
        for (var attempt = 0; attempt < 120; attempt++)
        {
            try
            {
                return new FileStream(lockFilePath, FileMode.OpenOrCreate, FileAccess.ReadWrite, FileShare.None);
            }
            catch (IOException)
            {
                if (attempt == 0)
                {
                    AnsiConsole.MarkupLine("[yellow]Waiting for another process to finish building the CLI...[/]");
                }

                Thread.Sleep(1000);
            }
        }

        throw new TimeoutException("Could not acquire CLI build lock after 120 seconds.");
    }

    private static string CalculateMd5HashForSolution()
    {
        // Get all files C# and C# project files in the Developer CLI solution
        var solutionFiles = Directory
            .EnumerateFiles(Configuration.CliFolder, "*.cs*", SearchOption.AllDirectories)
            .Where(f => !f.Contains("artifacts"))
            .ToList();

        using var sha256 = SHA256.Create();
        using var combinedStream = new MemoryStream();

        foreach (var file in solutionFiles)
        {
            using var fileStream = File.OpenRead(file);
            var hash = sha256.ComputeHash(fileStream);
            combinedStream.Write(hash, 0, hash.Length);
        }

        combinedStream.Position = 0;
        return BitConverter.ToString(sha256.ComputeHash(combinedStream));
    }

    private static void PublishDeveloperCli(string currentHash)
    {
        // Use a cross-process file lock to prevent concurrent CLI builds from conflicting.
        // Multiple MCP servers (or CLI instances) detecting the same change would otherwise
        // race to build and publish, causing file locking errors on shared build artifacts.
        var lockFilePath = Path.Combine(Configuration.PublishFolder, ".build.lock");
        Directory.CreateDirectory(Configuration.PublishFolder);

        var currentExecutablePath = Environment.ProcessPath!;
        var renamedExecutablePath = "";
        string? tempPublishFolder = null;

        try
        {
            using var buildLock = WaitForBuildLock(lockFilePath);

            // Re-check hash after acquiring lock - another process may have already built
            if (CalculateMd5HashForSolution() == Configuration.GetConfigurationSetting().Hash)
            {
                return;
            }

            AnsiConsole.MarkupLine("[green]Changes detected, rebuilding and publishing new CLI.[/]");

            // Build the project before renaming exe on Windows
            ProcessHelper.StartProcess("dotnet build", Configuration.CliFolder);

            if (Configuration.IsWindows)
            {
                // In Windows the executing assembly is locked by the process, blocking overwriting it, but not renaming
                // We rename the current executable to .previous.exe to unblock publishing of new executable
                renamedExecutablePath = currentExecutablePath.Replace(".exe", ".previous.exe");
                File.Move(currentExecutablePath, renamedExecutablePath, true);

                ProcessHelper.StartProcess(
                    $"dotnet publish DeveloperCli.csproj -o \"{Configuration.PublishFolder}\"",
                    Configuration.CliFolder
                );
            }
            else
            {
                // macOS/Linux: publish to a temp folder next to the publish folder, then atomically
                // rename each artifact into place. Overwriting the running CLI's single-file bundle
                // in place can leave the in-flight process unable to lazily load bundled assemblies
                // from a partially written file, surfacing as "Could not load file or assembly
                // System.IO.Pipelines". POSIX rename(2) atomically swaps paths; the running process
                // keeps its inode.
                tempPublishFolder = Path.Combine(Configuration.PublishFolder, $".publish-{Configuration.AliasName}.tmp");
                if (Directory.Exists(tempPublishFolder)) Directory.Delete(tempPublishFolder, recursive: true);

                ProcessHelper.StartProcess(
                    $"dotnet publish DeveloperCli.csproj -o \"{tempPublishFolder}\"",
                    Configuration.CliFolder
                );

                // Skip the config file -- the publish folder is shared across multiple project CLIs
                // and each one keeps its config (e.g. pp.json) here. Publish does not emit it, but
                // we exclude it defensively so a future change cannot clobber the hash.
                var configFileName = $"{Configuration.AliasName}.json";
                foreach (var publishedFile in Directory.EnumerateFiles(tempPublishFolder))
                {
                    var fileName = Path.GetFileName(publishedFile);
                    if (string.Equals(fileName, configFileName, StringComparison.OrdinalIgnoreCase)) continue;

                    var targetPath = Path.Combine(Configuration.PublishFolder, fileName);
                    File.Move(publishedFile, targetPath, overwrite: true);
                }

                Directory.Delete(tempPublishFolder, recursive: true);
                tempPublishFolder = null;
            }

            // Hash save is best-effort. The new binary is already in place, so a failure here only
            // means the next invocation re-publishes (slow but not broken). The known offender is
            // JsonSerializer lazily loading System.IO.Pipelines.dll on the post-publish path -- by
            // swallowing it here, the user's command still proceeds via the auto-rerun below.
            try
            {
                var configurationSetting = Configuration.GetConfigurationSetting();
                configurationSetting.Hash = currentHash;
                Configuration.SaveConfigurationSetting(configurationSetting);
            }
            catch
            {
                // Ignore -- the hash will be re-saved next time the CLI publishes successfully.
            }
        }
        catch (Exception e)
        {
            AnsiConsole.MarkupLine($"[red]Failed to publish new CLI. Please run 'dotnet run' to fix.[/]");
            AnsiConsole.WriteException(e);
            Environment.Exit(0);
        }
        finally
        {
            if (renamedExecutablePath != "" && !File.Exists(currentExecutablePath))
            {
                // If the publish command did not successfully create a new executable, put back the old one to ensure
                // the CLI is still working
                File.Move(renamedExecutablePath, currentExecutablePath);
            }

            if (tempPublishFolder is not null && Directory.Exists(tempPublishFolder))
            {
                try { Directory.Delete(tempPublishFolder, recursive: true); }
                catch { /* best-effort cleanup */ }
            }
        }
    }
}
