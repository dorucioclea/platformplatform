using System.Net;
using System.Net.Security;
using Microsoft.AspNetCore.Http.Extensions;
using Yarp.ReverseProxy.Forwarder;

namespace Account.Api;

// Dev-only proxy that forwards back-office static-asset and HMR traffic from the back-office Kestrel
// listener (BACK_OFFICE_KESTREL_PORT) to the rsbuild dev server (BACK_OFFICE_STATIC_PORT). Production
// builds bake the bundle into BackOfficeWebApp/dist and serve it via UseStaticFiles, so this proxy
// is registered only in development. The proxy must run before authentication so anonymous browsers
// can fetch /static/*, /rsbuild-hmr, and HMR /{filename}.hot-update.{ext} during the SPA bootstrap.
public static class BackOfficeDevStaticProxy
{
    public static IServiceCollection AddBackOfficeDevStaticProxy(this IServiceCollection services)
    {
        services.AddHttpForwarder();
        return services;
    }

    public static IApplicationBuilder UseBackOfficeDevStaticProxy(this WebApplication app, string backOfficeHostname)
    {
        if (!app.Environment.IsDevelopment()) return app;

        var rawPort = Environment.GetEnvironmentVariable("BACK_OFFICE_STATIC_PORT");
        if (!int.TryParse(rawPort, out var staticPort) || staticPort <= 0) return app;

        var destinationPrefix = $"https://localhost:{staticPort}";
        var forwarder = app.Services.GetRequiredService<IHttpForwarder>();
        var invoker = new HttpMessageInvoker(new SocketsHttpHandler
            {
                UseProxy = false,
                AllowAutoRedirect = false,
                AutomaticDecompression = DecompressionMethods.None,
                UseCookies = false,
                // The rsbuild dev server uses a self-signed certificate from Aspire; trust it locally.
                SslOptions = new SslClientAuthenticationOptions
                {
                    RemoteCertificateValidationCallback = (_, _, _, _) => true
                }
            }
        );

        app.UseWhen(
            context => IsBackOfficeStaticRequest(context, backOfficeHostname),
            branch => branch.Run(async context =>
                {
                    var error = await forwarder.SendAsync(context, destinationPrefix, invoker, ForwarderRequestConfig.Empty);
                    if (error != ForwarderError.None && !context.Response.HasStarted)
                    {
                        var feature = context.Features.Get<IForwarderErrorFeature>();
                        app.Logger.LogWarning(
                            feature?.Exception,
                            "Back-office dev static proxy failed for {Url}: {Error}",
                            context.Request.GetDisplayUrl(),
                            error
                        );
                        context.Response.StatusCode = StatusCodes.Status502BadGateway;
                    }
                }
            )
        );
        return app;
    }

    private static bool IsBackOfficeStaticRequest(HttpContext context, string backOfficeHostname)
    {
        if (!context.Request.Host.Host.Equals(backOfficeHostname, StringComparison.OrdinalIgnoreCase)) return false;

        var path = context.Request.Path.Value;
        if (string.IsNullOrEmpty(path)) return false;

        // /static/* covers all bundled JS/CSS chunks. /rsbuild-hmr is rsbuild's HMR WebSocket endpoint
        // (HTTP upgrade is handled by IHttpForwarder). The .hot-update.{ext} pattern catches HMR-delta
        // chunks rsbuild emits at the SPA root rather than under /static.
        if (path.StartsWith("/static/", StringComparison.OrdinalIgnoreCase)) return true;
        if (path.StartsWith("/rsbuild-hmr", StringComparison.OrdinalIgnoreCase)) return true;
        if (path.Contains(".hot-update.", StringComparison.OrdinalIgnoreCase)) return true;

        return false;
    }
}
