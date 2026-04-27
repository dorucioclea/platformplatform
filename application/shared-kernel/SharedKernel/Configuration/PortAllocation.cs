namespace SharedKernel.Configuration;

// Single source of truth for the local development port allocation. Reads .workspace/port.txt
// (single integer, whitespace-tolerant). If the file is missing, self-bootstraps with the default
// base port so the first run on a fresh checkout just works. Throws on a present-but-invalid file.
public sealed record PortAllocation(int BasePort)
{
    private const int DefaultBasePort = 9000;

    private const string WorkspaceDirectoryName = ".workspace";

    private const string PortFileName = "port.txt";

    public int AppGateway => BasePort;

    public int Aspire => BasePort + 1;

    public int Postgres => BasePort + 2;

    public int Blob => BasePort + 3;

    public int MailpitSmtp => BasePort + 4;

    public int MailpitHttp => BasePort + 5;

    public int Mcp => BasePort + 7;

    public int OtelEndpoint => BasePort + 8;

    public int ResourceService => BasePort + 9;

    public int MainApi => BasePort + 10;

    public int MainStatic => BasePort + 11;

    public int MainWorkers => BasePort + 12;

    public int AccountApi => BasePort + 13;

    public int AccountStatic => BasePort + 14;

    public int AccountWorkers => BasePort + 15;

    public int BackOfficeApi => BasePort + 16;

    public int BackOfficeStatic => BasePort + 17;

    public int BackOfficeWorkers => BasePort + 18;

    public int[] AllPorts =>
    [
        AppGateway, Aspire, Postgres, Blob, MailpitSmtp, MailpitHttp, Mcp, OtelEndpoint, ResourceService,
        MainApi, MainStatic, MainWorkers, AccountApi, AccountStatic, AccountWorkers, BackOfficeApi, BackOfficeStatic, BackOfficeWorkers
    ];

    // Empty on the default base port so existing developers' Docker volumes are reused unchanged on
    // upgrade; non-empty on any other base port so parallel Aspire stacks (typically run from
    // separate git worktrees with different .workspace/port.txt values) get isolated volumes
    // instead of corrupting each other's state.
    public string VolumeNameInfix => BasePort == DefaultBasePort ? string.Empty : $"-{BasePort}";

    // Resolves the repository root by walking up from AppContext.BaseDirectory looking for the
    // .git folder (always present in a checked-out repo, including git worktrees where .git is a
    // file pointing at the real worktree directory), then reads or bootstraps .workspace/port.txt.
    // Use LoadFrom(repositoryRoot) when AppContext.BaseDirectory is outside the repo (e.g., a
    // single-file CLI binary published to the user's home directory).
    public static PortAllocation Load()
    {
        return LoadFrom(FindRepositoryRoot(AppContext.BaseDirectory));
    }

    public static PortAllocation LoadFrom(string repositoryRoot)
    {
        var workspaceDirectory = Path.Combine(repositoryRoot, WorkspaceDirectoryName);
        var portFilePath = Path.Combine(workspaceDirectory, PortFileName);

        if (!File.Exists(portFilePath))
        {
            Directory.CreateDirectory(workspaceDirectory);
            File.WriteAllText(portFilePath, $"{DefaultBasePort}{Environment.NewLine}");
            return new PortAllocation(DefaultBasePort);
        }

        var content = File.ReadAllText(portFilePath).Trim();
        if (!int.TryParse(content, out var basePort) || basePort <= 0)
        {
            throw new InvalidOperationException(
                $"Port allocation file '{portFilePath}' must contain a positive integer. Got: '{content}'."
            );
        }

        return new PortAllocation(basePort);
    }

    // Atomically writes the base port to .workspace/port.txt under the given repository root.
    // Callers (e.g., the developer CLI's positional base-port argument on run/restart) use this to
    // update the file before any code path lazily loads PortAllocation -- otherwise the lazy load
    // would race with the write and could bootstrap with the default port.
    public static void WriteBasePort(string repositoryRoot, int basePort)
    {
        if (basePort <= 0) throw new ArgumentOutOfRangeException(nameof(basePort), basePort, "Base port must be a positive integer.");

        var workspaceDirectory = Path.Combine(repositoryRoot, WorkspaceDirectoryName);
        var portFilePath = Path.Combine(workspaceDirectory, PortFileName);
        var temporaryFilePath = portFilePath + ".tmp";

        Directory.CreateDirectory(workspaceDirectory);
        File.WriteAllText(temporaryFilePath, $"{basePort}{Environment.NewLine}");
        File.Move(temporaryFilePath, portFilePath, true);
    }

    private static string FindRepositoryRoot(string startDirectory)
    {
        var current = new DirectoryInfo(startDirectory);
        while (current is not null)
        {
            // .git is a directory in normal checkouts and a file in git worktrees -- both count.
            var gitMarker = Path.Combine(current.FullName, ".git");
            if (Directory.Exists(gitMarker) || File.Exists(gitMarker)) return current.FullName;
            current = current.Parent;
        }

        throw new InvalidOperationException(
            $"Could not locate the repository root walking up from '{startDirectory}'. Expected a '.git' directory or file."
        );
    }
}
