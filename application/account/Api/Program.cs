using System.Security.Claims;
using Account;
using Microsoft.Extensions.Options;
using SharedKernel.Authentication;
using SharedKernel.Authentication.BackOfficeIdentity;
using SharedKernel.Configuration;
using SharedKernel.ExecutionContext;
using SharedKernel.OpenApi;
using SharedKernel.SinglePageApp;

var builder = WebApplication.CreateBuilder(args);

// Configure storage infrastructure like Database, BlobStorage, Logging, Telemetry, Entity Framework DB Context, etc.
builder
    .AddApiInfrastructure()
    .AddDevelopmentPort()
    .AddAccountInfrastructure();

// Configure dependency injection services like Repositories, MediatR, Pipelines, FluentValidation validators, etc.
builder.Services
    .AddApiServices([Assembly.GetExecutingAssembly(), Configuration.Assembly], ApiDocumentLayout.AccountAndBackOffice)
    .AddAccountServices();

var app = builder.Build();

// At runtime AppHost surfaces both hostnames. At build time (dotnet-getdocument invokes Program.Main
// to generate OpenAPI), neither is set; fall back to placeholders so Program startup completes and
// the OpenAPI emitter can run. Production parity is enforced by AppHost passing real values.
var appHostname = app.Configuration["Hostnames:App"] ?? "app.unconfigured.invalid";
var backOfficeHostname = app.Services.GetRequiredService<IOptions<BackOfficeHostOptions>>().Value.Host;

app
    .UseApiServices() // Add common configuration for all APIs like Swagger, HSTS, and DeveloperExceptionPage.
    .UseHostScopedSinglePageAppFallback(
        new HostScopedSinglePageApp(
            appHostname,
            "WebApp",
            context => context.RequestServices.GetRequiredService<IExecutionContext>().UserInfo
        ),
        new HostScopedSinglePageApp(
            backOfficeHostname,
            "BackOfficeWebApp",
            BuildBackOfficeUserInfo
        )
    );

await app.RunAsync();
return;

static UserInfo BuildBackOfficeUserInfo(HttpContext context)
{
    var principal = context.User;
    if (principal.Identity?.IsAuthenticated != true)
    {
        return UserInfo.System;
    }

    var displayName = principal.FindFirstValue(ClaimTypes.Name);
    var groups = string.Join(',', principal.FindAll(BackOfficeIdentityDefaults.GroupsClaimType).Select(c => c.Value));

    return new UserInfo
    {
        IsAuthenticated = true,
        Locale = "en-US",
        FirstName = displayName,
        Role = string.IsNullOrEmpty(groups) ? null : groups
    };
}
