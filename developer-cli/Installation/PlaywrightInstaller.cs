using System.Diagnostics;
using DeveloperCli.Utilities;
using Spectre.Console;

namespace DeveloperCli.Installation;

public static class PlaywrightInstaller
{
    public static void EnsurePlaywrightBrowsers(bool quiet = false)
    {
        if (!quiet) AnsiConsole.MarkupLine("[blue]Ensuring Playwright browsers are installed...[/]");

        var command = Configuration.IsWindows
            ? "cmd.exe"
            : Configuration.IsLinux
                ? "sudo"
                : "npx";
        var arguments = Configuration.IsWindows
            ? "/C npx --yes playwright install --with-deps"
            : Configuration.IsLinux
                ? "npx --yes playwright install --with-deps"
                : "--yes playwright install --with-deps";

        if (quiet)
        {
            ProcessHelper.ExecuteQuietly($"{command} {arguments}", Configuration.ApplicationFolder);
        }
        else
        {
            var processStartInfo = new ProcessStartInfo
            {
                FileName = command,
                Arguments = arguments,
                WorkingDirectory = Configuration.ApplicationFolder,
                UseShellExecute = false
            };

            ProcessHelper.StartProcess(processStartInfo, throwOnError: true);
        }
    }
}
