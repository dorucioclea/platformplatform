using System.Net;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace AppGateway.Tests;

public sealed class LocalhostRedirectTests(AppGatewayApplicationFactory factory) : IClassFixture<AppGatewayApplicationFactory>
{
    [Theory]
    [InlineData("/", "https://app.dev.localhost:9000/")]
    [InlineData("/some/deep/path", "https://app.dev.localhost:9000/some/deep/path")]
    [InlineData(
        "/api/account/authentication/Google/login/callback?code=abc&state=xyz",
        "https://app.dev.localhost:9000/api/account/authentication/Google/login/callback?code=abc&state=xyz"
    )]
    public async Task Request_WhenHostIsLocalhost_ShouldReturn301WithLocationPreservingPathAndQuery(string pathAndQuery, string expectedLocation)
    {
        // Arrange
        var client = factory.CreateClient(new WebApplicationFactoryClientOptions { AllowAutoRedirect = false });
        var request = new HttpRequestMessage(HttpMethod.Get, $"http://localhost:9000{pathAndQuery}");

        // Act
        var response = await client.SendAsync(request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.MovedPermanently);
        response.Headers.Location.Should().NotBeNull();
        response.Headers.Location!.ToString().Should().Be(expectedLocation);
    }
}
