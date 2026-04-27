using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace AppGateway.Tests;

public sealed class UnknownHostFallbackTests(AppGatewayApplicationFactory factory) : IClassFixture<AppGatewayApplicationFactory>
{
    [Theory]
    [InlineData("other.dev.localhost")]
    [InlineData("typo.dev.localhost")]
    public async Task Request_WhenHostIsUnknown_ShouldReturn404WithProblemDetails(string unknownHost)
    {
        // Arrange
        var client = factory.CreateClient();
        var request = new HttpRequestMessage(HttpMethod.Get, $"http://{unknownHost}/");

        // Act
        var response = await client.SendAsync(request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        response.Content.Headers.ContentType?.MediaType.Should().Be("application/problem+json");

        var problemDetails = await response.Content.ReadFromJsonAsync<JsonElement>();
        problemDetails.GetProperty("status").GetInt32().Should().Be(404);
        problemDetails.GetProperty("title").GetString().Should().Be("Unknown host");
        problemDetails.GetProperty("detail").GetString().Should().Contain(unknownHost);

        var canonicalUrls = problemDetails.GetProperty("canonicalUrls").EnumerateArray().Select(e => e.GetString()).ToArray();
        canonicalUrls.Should().Contain(url => url!.Contains("app.dev.localhost"));
        canonicalUrls.Should().Contain(url => url!.Contains("back-office.dev.localhost"));
    }

    [Theory]
    [InlineData("other.dev.localhost")]
    [InlineData("typo.dev.localhost")]
    public async Task Request_WhenHostIsUnknown_ShouldReturn404RegardlessOfPath(string unknownHost)
    {
        // Arrange
        var client = factory.CreateClient();
        var request = new HttpRequestMessage(HttpMethod.Get, $"http://{unknownHost}/api/account/users");

        // Act
        var response = await client.SendAsync(request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Theory]
    [InlineData("app.dev.localhost")]
    [InlineData("back-office.dev.localhost")]
    public async Task Request_WhenHostIsKnown_ShouldNotHitUnknownHostFallback(string knownHost)
    {
        // Arrange
        var client = factory.CreateClient(new WebApplicationFactoryClientOptions { AllowAutoRedirect = false });
        var request = new HttpRequestMessage(HttpMethod.Get, $"http://{knownHost}/openapi");

        // Act
        var response = await client.SendAsync(request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Redirect);
        response.Content.Headers.ContentType?.MediaType.Should().NotBe("application/problem+json");
    }
}
