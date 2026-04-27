using System.Net;
using System.Net.Http.Headers;
using FluentAssertions;
using SharedKernel.Authentication.MockEasyAuth;
using Xunit;

namespace Account.Tests.BackOffice;

// Verifies the optional BACK_OFFICE_GROUP_ID enforcement: when configured, principals must carry that group.
public sealed class GroupRequirementTests() : BackOfficeEndpointBaseTest(RequiredGroupId)
{
    private const string RequiredGroupId = "BackOfficeAdmins";

    [Fact]
    public async Task GetMe_WhenPrincipalHasRequiredGroup_ShouldReturnOk()
    {
        // Arrange
        var admin = MockEasyAuthIdentities.Default.Single(i => i.Groups.Contains(RequiredGroupId));
        using var client = CreateBackOfficeClientForIdentity(admin);

        // Act
        var response = await client.GetAsync("/api/back-office/me");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetMe_WhenPrincipalLacksRequiredGroup_AndBrowserRequest_ShouldRedirectToAccessDenied()
    {
        // Arrange
        var plainUser = MockEasyAuthIdentities.Default.Single(i => i.Id == "plain");
        using var client = CreateBackOfficeClientForIdentity(plainUser);
        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("text/html"));

        // Act
        var response = await client.GetAsync("/api/back-office/me");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Redirect);
        response.Headers.Location.Should().NotBeNull();
        response.Headers.Location!.ToString().Should().Be("/access-denied");
    }

    [Fact]
    public async Task GetMe_WhenPrincipalLacksRequiredGroup_AndJsonRequest_ShouldReturnForbidden()
    {
        // Arrange
        var plainUser = MockEasyAuthIdentities.Default.Single(i => i.Id == "plain");
        using var client = CreateBackOfficeClientForIdentity(plainUser);
        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        // Act
        var response = await client.GetAsync("/api/back-office/me");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }
}
