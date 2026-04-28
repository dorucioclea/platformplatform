using System.Security.Cryptography;
using System.Text.Encodings.Web;
using System.Text.Json;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Primitives;
using SharedKernel.Authentication;
using SharedKernel.ExecutionContext;

namespace SharedKernel.SinglePageApp;

public static class SinglePageAppFallbackExtensions
{
    private static void SetResponseHttpHeaders(
        SinglePageAppConfiguration singlePageAppConfiguration,
        IHeaderDictionary responseHeaders,
        StringValues contentType,
        string nonce
    )
    {
        // No cache headers
        responseHeaders.Append("Cache-Control", "no-cache, no-store, must-revalidate");
        responseHeaders.Append("Pragma", "no-cache");

        // Security policy headers
        responseHeaders.Append("X-Content-Type-Options", "nosniff");
        responseHeaders.Append("X-Frame-Options", "DENY");
        responseHeaders.Append("X-XSS-Protection", "1; mode=block");
        responseHeaders.Append("Referrer-Policy", "no-referrer, strict-origin-when-cross-origin");
        responseHeaders.Append("Permissions-Policy", singlePageAppConfiguration.PermissionPolicies);

        // Content security policy header
        var contentSecurityPolicy = singlePageAppConfiguration.ContentSecurityPolicies.Replace("{NONCE_PLACEHOLDER}", nonce);
        responseHeaders.Append("Content-Security-Policy", contentSecurityPolicy);

        // Content type header
        responseHeaders.Append("Content-Type", contentType);
    }

    private static string GenerateAntiforgeryTokens(IAntiforgery antiforgery, HttpContext context)
    {
        // ASP.NET Core antiforgery system uses a cryptographic double-submit pattern with two tokens:
        // - A secret cookie token that only the server can read (session-based)
        // - A public request token that the SPA sends as a header for state-changing requests like POST/PUT/DELETE

        var antiforgeryTokenSet = antiforgery.GetAndStoreTokens(context);

        if (antiforgeryTokenSet.CookieToken is not null)
        {
            // A new antiforgery cookie is only generated once, as it must remain constant across browser tabs to avoid validation failures
            context.Response.Cookies.Append(
                AuthenticationTokenHttpKeys.AntiforgeryTokenCookieName,
                antiforgeryTokenSet.CookieToken!,
                new CookieOptions { HttpOnly = true, Secure = true, SameSite = SameSiteMode.Strict, Path = "/" }
            );
        }

        return antiforgeryTokenSet.RequestToken!;
    }

    private static string GetHtmlWithEnvironment(
        SinglePageAppConfiguration singlePageAppConfiguration,
        UserInfo userInfo,
        string antiforgeryHttpHeaderToken,
        string nonce
    )
    {
        var userInfoEncoded = JsonSerializer.Serialize(userInfo, SinglePageAppConfiguration.JsonHtmlEncodingOptions);

        // Escape the JSON for use in an HTML attribute
        var userInfoEscaped = HtmlEncoder.Default.Encode(userInfoEncoded);
        var html = singlePageAppConfiguration.GetHtmlTemplate();
        html = html.Replace("%ENCODED_RUNTIME_ENV%", singlePageAppConfiguration.StaticRuntimeEnvironmentEscaped);
        html = html.Replace("%ENCODED_USER_INFO_ENV%", userInfoEscaped);
        html = html.Replace("%LOCALE%", userInfo.Locale);
        html = html.Replace("%ANTIFORGERY_TOKEN%", antiforgeryHttpHeaderToken);
        html = html.Replace("%CSP_NONCE%", nonce);
        html = html.Replace("{{cspNonce}}", nonce);

        foreach (var variable in singlePageAppConfiguration.StaticRuntimeEnvironment)
        {
            html = html.Replace($"%{variable.Key}%", variable.Value);
        }

        return html;
    }

    extension(IServiceCollection services)
    {
        public IServiceCollection AddSinglePageAppFallback(Dictionary<string, string>? environmentVariables = null)
        {
            return services.AddSingleton<SinglePageAppConfiguration>(serviceProvider =>
                {
                    var environment = serviceProvider.GetRequiredService<IWebHostEnvironment>();
                    return new SinglePageAppConfiguration(environment.IsDevelopment(), environmentVariables);
                }
            );
        }
    }

    extension(WebApplication app)
    {
        public IApplicationBuilder UseFederatedModuleStaticFiles()
        {
            Directory.CreateDirectory(SinglePageAppConfiguration.BuildRootPath);

            return app
                .UseStaticFiles(new StaticFileOptions { FileProvider = new PhysicalFileProvider(SinglePageAppConfiguration.BuildRootPath) });
        }

        public IApplicationBuilder UseSinglePageAppFallback()
        {
            app.Map("/remoteEntry.js", (HttpContext context, SinglePageAppConfiguration singlePageAppConfiguration) =>
                {
                    var nonce = Convert.ToBase64String(RandomNumberGenerator.GetBytes(16));

                    SetResponseHttpHeaders(singlePageAppConfiguration, context.Response.Headers, "application/javascript", nonce);

                    var javaScript = singlePageAppConfiguration.GetRemoteEntryJs();
                    return context.Response.WriteAsync(javaScript);
                }
            );

            app.MapFallback((
                    HttpContext context,
                    IExecutionContext executionContext,
                    IAntiforgery antiforgery,
                    SinglePageAppConfiguration singlePageAppConfiguration
                ) =>
                {
                    if (context.Request.Path.Value?.Contains("/api/", StringComparison.OrdinalIgnoreCase) == true ||
                        context.Request.Path.Value?.Contains("/internal-api/", StringComparison.OrdinalIgnoreCase) == true)
                    {
                        context.Response.StatusCode = StatusCodes.Status404NotFound;
                        context.Response.ContentType = "text/plain";
                        return context.Response.WriteAsync("404 Not Found");
                    }

                    var nonce = Convert.ToBase64String(RandomNumberGenerator.GetBytes(16));

                    SetResponseHttpHeaders(singlePageAppConfiguration, context.Response.Headers, "text/html; charset=utf-8", nonce);

                    var antiforgeryHttpHeaderToken = GenerateAntiforgeryTokens(antiforgery, context);

                    var html = GetHtmlWithEnvironment(singlePageAppConfiguration, executionContext.UserInfo, antiforgeryHttpHeaderToken, nonce);

                    return context.Response.WriteAsync(html);
                }
            );

            Directory.CreateDirectory(SinglePageAppConfiguration.BuildRootPath);

            return app
                .UseStaticFiles(new StaticFileOptions { FileProvider = new PhysicalFileProvider(SinglePageAppConfiguration.BuildRootPath) })
                .UseRequestLocalization(SinglePageAppConfiguration.SupportedLocalizations);
        }

        // Registers one MapFallback per host-scoped SPA so a single container can serve multiple SPAs
        // bound to different hostnames (e.g. consolidated account-api hosting account/WebApp on the
        // user-facing host and account/BackOfficeWebApp on the back-office host). Each entry serves its
        // own bundle directory, embeds its own userInfo, and is restricted via RequireHost.
        public IApplicationBuilder UseHostScopedSinglePageAppFallback(params HostScopedSinglePageApp[] singlePageApps)
        {
            if (singlePageApps.Length == 0)
            {
                throw new ArgumentException("At least one host-scoped SPA must be provided.", nameof(singlePageApps));
            }

            var environment = app.Services.GetRequiredService<IWebHostEnvironment>();

            foreach (var singlePageApp in singlePageApps)
            {
                var configuration = new SinglePageAppConfiguration(
                    environment.IsDevelopment(),
                    singlePageApp.EnvironmentVariables,
                    singlePageApp.WebAppProjectName
                );

                Directory.CreateDirectory(configuration.BundleDirectory);

                var fileProvider = new PhysicalFileProvider(configuration.BundleDirectory);
                var spa = singlePageApp;

                app.MapGet("/remoteEntry.js", context =>
                    {
                        var nonce = Convert.ToBase64String(RandomNumberGenerator.GetBytes(16));

                        SetResponseHttpHeaders(configuration, context.Response.Headers, "application/javascript", nonce);

                        var javaScript = configuration.GetRemoteEntryJs();
                        return context.Response.WriteAsync(javaScript);
                    }
                ).RequireHost(spa.Host);

                app.MapFallback((HttpContext context, IAntiforgery antiforgery) =>
                    {
                        if (context.Request.Path.Value?.Contains("/api/", StringComparison.OrdinalIgnoreCase) == true ||
                            context.Request.Path.Value?.Contains("/internal-api/", StringComparison.OrdinalIgnoreCase) == true)
                        {
                            context.Response.StatusCode = StatusCodes.Status404NotFound;
                            context.Response.ContentType = "text/plain";
                            return context.Response.WriteAsync("404 Not Found");
                        }

                        var nonce = Convert.ToBase64String(RandomNumberGenerator.GetBytes(16));

                        SetResponseHttpHeaders(configuration, context.Response.Headers, "text/html; charset=utf-8", nonce);

                        var antiforgeryHttpHeaderToken = GenerateAntiforgeryTokens(antiforgery, context);

                        var userInfo = spa.UserInfoFactory(context);
                        var html = GetHtmlWithEnvironment(configuration, userInfo, antiforgeryHttpHeaderToken, nonce);

                        return context.Response.WriteAsync(html);
                    }
                ).RequireHost(spa.Host);

                app.UseStaticFiles(new StaticFileOptions { FileProvider = fileProvider });
            }

            return app.UseRequestLocalization(SinglePageAppConfiguration.SupportedLocalizations);
        }
    }
}
