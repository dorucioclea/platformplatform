using Microsoft.AspNetCore.Http;
using SharedKernel.Authentication;

namespace SharedKernel.SinglePageApp;

/// <summary>
///     Describes a single SPA inside a multi-SPA host. Each entry maps a hostname to its bundle directory and
///     decides how to derive the <see cref="UserInfo" /> embedded in the served HTML.
///     One <see cref="HostScopedSinglePageApp" /> per <c>RequireHost</c>-scoped fallback registered by
///     <c>UseHostScopedSinglePageAppFallback</c>; the consolidated <c>account-api</c> hosts both
///     <c>account/WebApp</c> and <c>account/BackOfficeWebApp</c> through this mechanism.
/// </summary>
public sealed class HostScopedSinglePageApp(
    string host,
    string webAppProjectName,
    Func<HttpContext, UserInfo> userInfoFactory,
    Dictionary<string, string>? environmentVariables = null
)
{
    /// <summary>The hostname this SPA is served on (used for <c>RequireHost</c>).</summary>
    public string Host { get; } = host;

    /// <summary>Folder name inside <c>application/&lt;scs&gt;/</c> that holds the SPA's <c>dist/</c>.</summary>
    public string WebAppProjectName { get; } = webAppProjectName;

    /// <summary>
    ///     Returns the <see cref="UserInfo" /> embedded into the HTML for this host. The account host uses
    ///     <c>IExecutionContext.UserInfo</c>; the back-office host derives display name and groups from the
    ///     <c>BackOfficeIdentity</c> claims (see <c>BackOfficeIdentityDefaults.GroupsClaimType</c>).
    /// </summary>
    public Func<HttpContext, UserInfo> UserInfoFactory { get; } = userInfoFactory;

    /// <summary>Per-SPA runtime environment variables embedded into the HTML alongside <c>userInfo</c>.</summary>
    public Dictionary<string, string>? EnvironmentVariables { get; } = environmentVariables;
}
