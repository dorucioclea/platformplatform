using System.Net;
using System.Text;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using SharedKernel.Authentication.BackOfficeIdentity;

namespace SharedKernel.Authentication.MockEasyAuth;

public sealed class MockEasyAuthMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path;
        var method = context.Request.Method;

        if (HttpMethods.IsGet(method) && path.Equals(BackOfficeIdentityDefaults.LoginPath, StringComparison.OrdinalIgnoreCase))
        {
            await RenderLoginPageAsync(context);
            return;
        }

        if (HttpMethods.IsGet(method) && path.Equals(BackOfficeIdentityDefaults.CallbackPath, StringComparison.OrdinalIgnoreCase))
        {
            HandleCallback(context);
            return;
        }

        if (HttpMethods.IsGet(method) && path.Equals(BackOfficeIdentityDefaults.LogoutPath, StringComparison.OrdinalIgnoreCase))
        {
            HandleLogout(context);
            return;
        }

        InjectClientPrincipalHeaders(context);
        await next(context);
    }

    private static void InjectClientPrincipalHeaders(HttpContext context)
    {
        if (!context.Request.Cookies.TryGetValue(MockEasyAuthCookie.CookieName, out var identityId)) return;
        var identity = MockEasyAuthIdentities.Find(identityId);
        if (identity is null) return;

        context.Request.Headers[BackOfficeIdentityDefaults.PrincipalNameHeader] = identity.Name;
        context.Request.Headers[BackOfficeIdentityDefaults.PrincipalIdHeader] = identity.ObjectId;
        context.Request.Headers[BackOfficeIdentityDefaults.PrincipalPayloadHeader] = MockEasyAuthCookie.EncodePayload(identity);
    }

    private static async Task RenderLoginPageAsync(HttpContext context)
    {
        var redirect = context.Request.Query["post_login_redirect_uri"].ToString();
        if (string.IsNullOrEmpty(redirect)) redirect = "/";

        var encodedRedirect = HtmlEncoder.Default.Encode(redirect);
        var urlEncodedRedirect = UrlEncoder.Default.Encode(redirect);

        var builder = new StringBuilder();
        builder.Append("<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"utf-8\"><title>Mock Easy Auth</title>");
        builder.Append("<style>body{font-family:system-ui,sans-serif;max-width:40rem;margin:2rem auto;padding:0 1rem;}");
        builder.Append("h1{font-size:1.25rem;}ul{list-style:none;padding:0;}li{margin:0.5rem 0;}");
        builder.Append("a.identity{display:block;padding:0.75rem 1rem;border:1px solid #ccc;border-radius:0.5rem;text-decoration:none;color:inherit;}");
        builder.Append("a.identity:hover{background:#f5f5f5;}small{color:#666;}</style></head><body>");
        builder.Append("<h1>Mock Easy Auth - pick an identity</h1>");
        builder.Append("<p>Local development sign-in. Production uses Azure Container Apps built-in authentication.</p>");
        builder.Append($"<p><small>After sign-in you will be redirected to: <code>{encodedRedirect}</code></small></p>");
        builder.Append("<ul>");
        foreach (var identity in MockEasyAuthIdentities.Default)
        {
            var groupsText = identity.Groups.IsEmpty ? "No group claims" : $"Groups: {string.Join(", ", identity.Groups)}";
            builder.Append("<li>");
            builder.Append($"<a class=\"identity\" href=\"{BackOfficeIdentityDefaults.CallbackPath}?identity={UrlEncoder.Default.Encode(identity.Id)}&post_login_redirect_uri={urlEncodedRedirect}\">");
            builder.Append($"<strong>{HtmlEncoder.Default.Encode(identity.Name)}</strong><br/>");
            builder.Append($"<small>{HtmlEncoder.Default.Encode(groupsText)}</small>");
            builder.Append("</a></li>");
        }

        builder.Append("</ul></body></html>");

        context.Response.StatusCode = (int)HttpStatusCode.OK;
        context.Response.ContentType = "text/html; charset=utf-8";
        await context.Response.WriteAsync(builder.ToString());
    }

    private static void HandleCallback(HttpContext context)
    {
        var identityId = context.Request.Query["identity"].ToString();
        var redirect = context.Request.Query["post_login_redirect_uri"].ToString();
        if (string.IsNullOrEmpty(redirect)) redirect = "/";

        var identity = MockEasyAuthIdentities.Find(identityId);
        if (identity is null)
        {
            context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
            return;
        }

        context.Response.Cookies.Append(MockEasyAuthCookie.CookieName, identity.Id, new CookieOptions
            {
                HttpOnly = true,
                Secure = context.Request.IsHttps,
                SameSite = SameSiteMode.Lax,
                Path = "/"
            }
        );
        context.Response.Redirect(redirect);
    }

    private static void HandleLogout(HttpContext context)
    {
        context.Response.Cookies.Delete(MockEasyAuthCookie.CookieName, new CookieOptions { Path = "/" });
        var redirect = context.Request.Query["post_logout_redirect_uri"].ToString();
        if (string.IsNullOrEmpty(redirect)) redirect = "/";
        context.Response.Redirect(redirect);
    }
}

public static class MockEasyAuthMiddlewareExtensions
{
    extension(IApplicationBuilder app)
    {
        public IApplicationBuilder UseMockEasyAuthInDevelopment()
        {
            var environment = app.ApplicationServices.GetRequiredService<IWebHostEnvironment>();
            return environment.IsDevelopment() ? app.UseMiddleware<MockEasyAuthMiddleware>() : app;
        }
    }
}
