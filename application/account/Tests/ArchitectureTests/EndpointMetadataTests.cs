using FluentAssertions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using SharedKernel.OpenApi;
using Xunit;

namespace Account.Tests.ArchitectureTests;

// Walks the actual registered endpoints in Account.Api and enforces:
// - Every endpoint under /api/back-office/* must declare RequireHost.
// - Every endpoint under /api/account/* and /internal-api/account/* must declare WithGroupName("account").
// - Every endpoint under /api/back-office/* must declare WithGroupName("back-office").
public sealed class EndpointMetadataTests : IDisposable
{
    private readonly WebApplicationFactory<Program> _webApplicationFactory;

    public EndpointMetadataTests()
    {
        _webApplicationFactory = new WebApplicationFactory<Program>().WithWebHostBuilder(builder => builder.ConfigureLogging(logging => logging.AddFilter(_ => false)));
        // Force the host to start so the endpoint data source is populated.
        _ = _webApplicationFactory.Server;
    }

    public void Dispose()
    {
        _webApplicationFactory.Dispose();
    }

    [Fact]
    public void BackOfficeEndpoints_ShouldAllRequireHost()
    {
        // Arrange
        var routeEndpoints = GetRouteEndpoints();
        var backOfficeEndpoints = routeEndpoints
            .Where(endpoint => endpoint.RoutePattern.RawText is { } pattern && pattern.StartsWith("/api/back-office", StringComparison.OrdinalIgnoreCase))
            .ToList();
        backOfficeEndpoints.Should().NotBeEmpty("the back-office route group must register at least one endpoint");

        // Assert
        var endpointsMissingHost = backOfficeEndpoints
            .Where(endpoint => endpoint.Metadata.GetMetadata<IHostMetadata>() is null)
            .Select(endpoint => endpoint.RoutePattern.RawText)
            .ToList();
        endpointsMissingHost.Should().BeEmpty("back-office endpoints must declare RequireHost so they cannot be reached via the user-facing host");
    }

    [Fact]
    public void AccountEndpoints_ShouldAllDeclareAccountGroupName()
    {
        // Arrange
        var routeEndpoints = GetRouteEndpoints();
        var accountEndpoints = routeEndpoints
            .Where(endpoint => endpoint.RoutePattern.RawText is { } pattern && (pattern.StartsWith("/api/account", StringComparison.OrdinalIgnoreCase) || pattern.StartsWith("/internal-api/account", StringComparison.OrdinalIgnoreCase)))
            .ToList();
        accountEndpoints.Should().NotBeEmpty();

        // Assert
        var endpointsMissingGroupName = accountEndpoints
            .Where(endpoint => endpoint.Metadata.GetMetadata<IEndpointGroupNameMetadata>()?.EndpointGroupName != OpenApiDocumentNames.Account)
            .Select(endpoint => endpoint.RoutePattern.RawText)
            .ToList();
        endpointsMissingGroupName.Should().BeEmpty("account endpoints must declare WithGroupName(\"account\") so they appear in the account OpenAPI document");
    }

    [Fact]
    public void BackOfficeEndpoints_ShouldAllDeclareBackOfficeGroupName()
    {
        // Arrange
        var routeEndpoints = GetRouteEndpoints();
        var backOfficeEndpoints = routeEndpoints
            .Where(endpoint => endpoint.RoutePattern.RawText is { } pattern && pattern.StartsWith("/api/back-office", StringComparison.OrdinalIgnoreCase))
            .ToList();

        // Assert
        var endpointsMissingGroupName = backOfficeEndpoints
            .Where(endpoint => endpoint.Metadata.GetMetadata<IEndpointGroupNameMetadata>()?.EndpointGroupName != OpenApiDocumentNames.BackOffice)
            .Select(endpoint => endpoint.RoutePattern.RawText)
            .ToList();
        endpointsMissingGroupName.Should().BeEmpty("back-office endpoints must declare WithGroupName(\"back-office\") so they appear in the back-office OpenAPI document");
    }

    private List<RouteEndpoint> GetRouteEndpoints()
    {
        return _webApplicationFactory.Services
            .GetRequiredService<EndpointDataSource>()
            .Endpoints
            .OfType<RouteEndpoint>()
            .ToList();
    }
}
