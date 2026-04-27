using AppGateway;
using AppGateway.ApiAggregation;
using AppGateway.Filters;
using AppGateway.Middleware;
using AppGateway.Transformations;
using Azure.Core;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Scalar.AspNetCore;
using SharedKernel.Configuration;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddOptions<HostnamesOptions>()
    .Bind(builder.Configuration.GetSection(HostnamesOptions.SectionName))
    .ValidateDataAnnotations()
    .Validate(o => !string.IsNullOrWhiteSpace(o.App), "Hostnames:App must be configured.")
    .Validate(o => !string.IsNullOrWhiteSpace(o.BackOffice), "Hostnames:BackOffice must be configured.")
    .ValidateOnStart();

var reverseProxyBuilder = builder.Services
    .AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"))
    .AddConfigFilter<ClusterDestinationConfigFilter>()
    .AddConfigFilter<ApiExplorerRouteFilter>()
    .AddConfigFilter<HostMatchConfigFilter>()
    .AddTransforms(context => context.RequestTransforms.Add(context.Services.GetRequiredService<BlockInternalApiTransform>()));

if (SharedInfrastructureConfiguration.IsRunningInAzure)
{
    builder.Services.AddSingleton<TokenCredential>(SharedInfrastructureConfiguration.DefaultAzureCredential);
    builder.Services.AddSingleton<ManagedIdentityTransform>();
    builder.Services.AddSingleton<ApiVersionHeaderTransform>();
    builder.Services.AddSingleton<HttpStrictTransportSecurityTransform>();
    reverseProxyBuilder.AddTransforms(context =>
        {
            context.RequestTransforms.Add(context.Services.GetRequiredService<ManagedIdentityTransform>());
            context.RequestTransforms.Add(context.Services.GetRequiredService<ApiVersionHeaderTransform>());
            context.ResponseTransforms.Add(context.Services.GetRequiredService<HttpStrictTransportSecurityTransform>());
        }
    );
}
else
{
    builder.Services.AddSingleton<SharedAccessSignatureRequestTransform>();
    reverseProxyBuilder.AddTransforms(context => context.RequestTransforms.Add(context.Services.GetRequiredService<SharedAccessSignatureRequestTransform>())
    );
}

builder.AddNamedBlobStorages([("account-storage", "ACCOUNT_STORAGE_URL")]);

builder.WebHost.UseKestrel(option => option.AddServerHeader = false);

builder.Services.AddHttpClient(
    "Account",
    client => { client.BaseAddress = new Uri(Environment.GetEnvironmentVariable("ACCOUNT_API_URL") ?? "https://localhost:9100"); }
);

builder.Services
    .AddHttpClient()
    .AddHttpForwardHeaders() // Ensure the correct client IP addresses are set for downstream requests
    .AddOutputCache();

builder.Services
    .AddSingleton(SharedDependencyConfiguration.GetTokenSigningService())
    .AddSingleton<BlockInternalApiTransform>()
    .AddSingleton<LocalhostRedirectMiddleware>()
    .AddSingleton<AuthenticationCookieMiddleware>()
    .AddScoped<ApiAggregationService>();

var app = builder.Build();

app.ApiAggregationEndpoints();

app.UseForwardedHeaders() // Enable support for proxy headers such as X-Forwarded-For and X-Forwarded-Proto. Should run before other middleware.
    .UseMiddleware<LocalhostRedirectMiddleware>()
    .UseOutputCache()
    .UseMiddleware<AuthenticationCookieMiddleware>();

app.MapScalarApiReference("/openapi", options =>
    {
        options
            .WithOpenApiRoutePattern("/openapi/v1.json")
            .WithDefaultHttpClient(ScalarTarget.CSharp, ScalarClient.HttpClient)
            .WithTitle("PlatformPlatform API");
    }
);

app.MapReverseProxy();

app.MapFallback((HttpContext context, IOptions<HostnamesOptions> hostnameOptions) =>
    {
        var hostnames = hostnameOptions.Value;
        var port = context.Request.Host.Port ?? 9000;
        var problemDetails = new ProblemDetails
        {
            Status = StatusCodes.Status404NotFound,
            Title = "Unknown host",
            Detail = $"The host '{context.Request.Host}' is not recognized. Use one of the canonical URLs.",
            Type = "https://tools.ietf.org/html/rfc9110#section-15.5.5",
            Extensions =
            {
                ["canonicalUrls"] = new[] { $"https://{hostnames.App}:{port}", $"https://{hostnames.BackOffice}:{port}" }
            }
        };

        return Results.Problem(problemDetails);
    }
);

await app.RunAsync();
