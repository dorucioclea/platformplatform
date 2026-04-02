using DeveloperCli.Installation;

namespace DeveloperCli.Utilities;

public static class WorkspaceHelper
{
    public static string EnsureWorkspace()
    {
        var workspaceFolder = Configuration.WorkspaceFolder;

        Directory.CreateDirectory(workspaceFolder);

        var gitFolder = Path.Combine(workspaceFolder, ".git");
        if (!Directory.Exists(gitFolder))
        {
            ProcessHelper.StartProcess($"git init \"{workspaceFolder}\"", Configuration.SourceCodeFolder);
        }

        return workspaceFolder;
    }
}
