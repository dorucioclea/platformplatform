using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Xunit;
using Yarp.ReverseProxy.Configuration;

namespace AppGateway.Tests;

public sealed class RouteConfigurationTests(AppGatewayApplicationFactory factory) : IClassFixture<AppGatewayApplicationFactory>
{
    [Theory]
    [InlineData("account-api")]
    [InlineData("account-federation")]
    [InlineData("account-static")]
    [InlineData("account-hmr")]
    [InlineData("main-static")]
    [InlineData("main-hmr")]
    [InlineData("main")]
    public void AppRoutes_ShouldDeclareAppHostnameKey(string routeId)
    {
        // Act
        var route = GetRoute(routeId);

        // Assert
        route.Metadata.Should().ContainKey("HostnameKey").WhoseValue.Should().Be("App");
    }

    [Theory]
    [InlineData("back-office-api")]
    [InlineData("back-office-auth")]
    [InlineData("back-office-spa")]
    [InlineData("back-office-static")]
    [InlineData("back-office-hmr")]
    public void BackOfficeRoutes_ShouldDeclareBackOfficeHostnameKey(string routeId)
    {
        // Act
        var route = GetRoute(routeId);

        // Assert
        route.Metadata.Should().ContainKey("HostnameKey").WhoseValue.Should().Be("BackOffice");
    }

    [Theory]
    [InlineData("favicon")]
    [InlineData("apple-touch-icon")]
    [InlineData("manifest")]
    [InlineData("robots")]
    [InlineData("tracking")]
    [InlineData("avatars")]
    [InlineData("logos")]
    [InlineData("account-legal-documents")]
    public void AssetRoutes_ShouldDeclareWildcardHostnameKey(string routeId)
    {
        // Act
        var route = GetRoute(routeId);

        // Assert
        route.Metadata.Should().ContainKey("HostnameKey").WhoseValue.Should().Be("*");
    }

    [Fact]
    public void EveryConfiguredRoute_ShouldDeclareHostnameKeyMetadata()
    {
        // Arrange
        using var scope = factory.Services.CreateScope();
        var provider = scope.ServiceProvider.GetRequiredService<IProxyConfigProvider>();

        // Act
        var routes = provider.GetConfig().Routes;

        // Assert
        routes.Should().NotBeEmpty();
        foreach (var route in routes)
        {
            route.Metadata.Should().NotBeNull($"route '{route.RouteId}' must declare metadata");
            route.Metadata.Should().ContainKey("HostnameKey", $"route '{route.RouteId}' must declare a HostnameKey");
        }
    }

    [Fact]
    public void BackOfficeSpa_ShouldMatchRootCatchAllPath()
    {
        // Act
        var route = GetRoute("back-office-spa");

        // Assert
        route.Match.Path.Should().Be("/{**catch-all}");
    }

    [Fact]
    public void BackOfficeStatic_ShouldMatchRootStaticPath()
    {
        // Act
        var route = GetRoute("back-office-static");

        // Assert
        route.Match.Path.Should().Be("/static/{**catch-all}");
    }

    [Fact]
    public void BackOfficeHmr_ShouldMatchRootHmrPath()
    {
        // Act
        var route = GetRoute("back-office-hmr");

        // Assert
        route.Match.Path.Should().Be("/{filename}.hot-update.{ext}");
    }

    [Fact]
    public void BackOfficeApi_ShouldPreserveApiBackOfficePath()
    {
        // Act
        var route = GetRoute("back-office-api");

        // Assert
        route.Match.Path.Should().Be("/api/back-office/{**catch-all}");
    }

    private RouteConfig GetRoute(string routeId)
    {
        using var scope = factory.Services.CreateScope();
        var provider = scope.ServiceProvider.GetRequiredService<IProxyConfigProvider>();
        var route = provider.GetConfig().Routes.SingleOrDefault(r => r.RouteId == routeId);
        route.Should().NotBeNull($"route '{routeId}' should exist in AppGateway configuration");
        return route;
    }
}
