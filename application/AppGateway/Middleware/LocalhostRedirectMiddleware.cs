using Microsoft.Extensions.Options;

namespace AppGateway.Middleware;

public sealed class LocalhostRedirectMiddleware(IOptions<HostnamesOptions> hostnamesOptions) : IMiddleware
{
    private const string LocalhostHost = "localhost";

    private readonly HostnamesOptions _hostnames = hostnamesOptions.Value;

    public Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        if (!string.Equals(context.Request.Host.Host, LocalhostHost, StringComparison.OrdinalIgnoreCase))
        {
            return next(context);
        }

        var port = context.Request.Host.Port ?? 9000;
        var location = $"https://{_hostnames.App}:{port}{context.Request.Path}{context.Request.QueryString}";

        context.Response.StatusCode = StatusCodes.Status301MovedPermanently;
        context.Response.Headers.Location = location;
        return Task.CompletedTask;
    }
}
