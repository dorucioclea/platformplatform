using System.Net;
using Account.Integrations.Gravatar;
using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;
using Polly.CircuitBreaker;
using SharedKernel.Domain;
using Xunit;

namespace Account.Tests.Integrations.Gravatar;

public sealed class GravatarClientTests
{
    [Fact]
    public async Task GetGravatar_WhenHandlerThrowsHttpRequestException_ShouldReturnNull()
    {
        // Arrange
        var client = CreateClient(new ThrowingHandler(new HttpRequestException("Simulated upstream failure")));

        // Act
        var result = await client.GetGravatar(UserId.NewId(), "user@example.com", CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetGravatar_WhenHandlerThrowsBrokenCircuitException_ShouldReturnNull()
    {
        // Arrange
        var client = CreateClient(new ThrowingHandler(new BrokenCircuitException("Simulated open circuit")));

        // Act
        var result = await client.GetGravatar(UserId.NewId(), "user@example.com", CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetGravatar_WhenHandlerThrowsTaskCanceledException_ShouldReturnNull()
    {
        // Arrange
        var client = CreateClient(new ThrowingHandler(new TaskCanceledException("Simulated timeout")));

        // Act
        var result = await client.GetGravatar(UserId.NewId(), "user@example.com", CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetGravatar_WhenHandlerReturns503_ShouldReturnNull()
    {
        // Arrange
        var client = CreateClient(new StatusCodeHandler(HttpStatusCode.ServiceUnavailable));

        // Act
        var result = await client.GetGravatar(UserId.NewId(), "user@example.com", CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }

    private static GravatarClient CreateClient(HttpMessageHandler handler)
    {
        var httpClient = new HttpClient(handler) { BaseAddress = new Uri("https://gravatar.com/") };
        return new GravatarClient(httpClient, NullLogger<GravatarClient>.Instance);
    }

    private sealed class ThrowingHandler(Exception exception) : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            throw exception;
        }
    }

    private sealed class StatusCodeHandler(HttpStatusCode statusCode) : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            return Task.FromResult(new HttpResponseMessage(statusCode));
        }
    }
}
