using System.Net;
using System.Security.Claims;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace SharedKernel.Authentication.BackOfficeIdentity;

public sealed class BackOfficeIdentityHandler(
    IOptionsMonitor<BackOfficeIdentityOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder
) : AuthenticationHandler<BackOfficeIdentityOptions>(options, logger, encoder)
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    protected override Task HandleChallengeAsync(AuthenticationProperties properties)
    {
        if (PrefersHtml(Request))
        {
            var redirectTarget = $"{Request.Path}{Request.QueryString}";
            var loginUrl = $"{BackOfficeIdentityDefaults.LoginPath}?post_login_redirect_uri={Uri.EscapeDataString(redirectTarget)}";
            Response.Redirect(loginUrl);
            return Task.CompletedTask;
        }

        Response.StatusCode = (int)HttpStatusCode.Unauthorized;
        return Task.CompletedTask;
    }

    protected override Task HandleForbiddenAsync(AuthenticationProperties properties)
    {
        if (PrefersHtml(Request))
        {
            Response.Redirect(BackOfficeIdentityDefaults.AccessDeniedPath);
            return Task.CompletedTask;
        }

        Response.StatusCode = (int)HttpStatusCode.Forbidden;
        return Task.CompletedTask;
    }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var name = Context.Request.Headers[BackOfficeIdentityDefaults.PrincipalNameHeader].ToString();
        if (string.IsNullOrWhiteSpace(name))
        {
            return Task.FromResult(AuthenticateResult.NoResult());
        }

        var oid = Context.Request.Headers[BackOfficeIdentityDefaults.PrincipalIdHeader].ToString();
        var payload = Context.Request.Headers[BackOfficeIdentityDefaults.PrincipalPayloadHeader].ToString();

        var claims = new List<Claim>
        {
            new(ClaimTypes.Name, name)
        };

        if (!string.IsNullOrWhiteSpace(oid))
        {
            claims.Add(new Claim(ClaimTypes.NameIdentifier, oid));
        }

        if (!string.IsNullOrWhiteSpace(payload))
        {
            var principal = TryDecodePayload(payload);
            if (principal?.Claims is not null)
            {
                foreach (var claim in principal.Claims)
                {
                    if (string.IsNullOrEmpty(claim.Type)) continue;
                    if (claim.Type is ClaimTypes.Name or ClaimTypes.NameIdentifier) continue;
                    claims.Add(new Claim(claim.Type, claim.Value));
                }
            }
        }

        var identity = new ClaimsIdentity(claims, BackOfficeIdentityDefaults.AuthenticationScheme, ClaimTypes.Name, ClaimTypes.Role);
        var ticket = new AuthenticationTicket(new ClaimsPrincipal(identity), Scheme.Name);
        return Task.FromResult(AuthenticateResult.Success(ticket));
    }

    private static bool PrefersHtml(HttpRequest request)
    {
        var accept = request.Headers.Accept.ToString();
        if (string.IsNullOrEmpty(accept)) return false;
        return accept.Contains("text/html", StringComparison.OrdinalIgnoreCase);
    }

    private static BackOfficeClientPrincipal? TryDecodePayload(string base64Payload)
    {
        try
        {
            var bytes = Convert.FromBase64String(base64Payload);
            var json = Encoding.UTF8.GetString(bytes);
            return JsonSerializer.Deserialize<BackOfficeClientPrincipal>(json, JsonOptions);
        }
        catch (FormatException)
        {
            return null;
        }
        catch (JsonException)
        {
            return null;
        }
    }
}
