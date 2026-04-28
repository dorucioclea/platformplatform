using Account.Features.Authentication.Commands;
using Account.Features.Authentication.Queries;
using SharedKernel.ApiResults;
using SharedKernel.Authentication.TokenGeneration;
using SharedKernel.Endpoints;
using SharedKernel.OpenApi;

namespace Account.Api.Endpoints;

public sealed class AuthenticationEndpoints : IEndpoints
{
    private const string RoutesPrefix = "/api/account/authentication";

    public void MapEndpoints(IEndpointRouteBuilder routes)
    {
        var appHost = routes.ServiceProvider.GetRequiredService<IConfiguration>()["Hostnames:App"]!;

        var group = routes.MapGroup(RoutesPrefix).WithTags("Authentication").WithGroupName(OpenApiDocumentNames.Account).RequireHost(appHost).RequireAuthorization().ProducesValidationProblem();

        group.MapPost("/logout", async Task<ApiResult> (IMediator mediator)
            => await mediator.Send(new LogoutCommand())
        );

        group.MapPost("/switch-tenant", async Task<ApiResult> (SwitchTenantCommand command, IMediator mediator)
            => await mediator.Send(command)
        );

        group.MapGet("/sessions", async Task<ApiResult<UserSessionsResponse>> ([AsParameters] GetUserSessionsQuery query, IMediator mediator)
            => await mediator.Send(query)
        ).Produces<UserSessionsResponse>();

        group.MapDelete("/sessions/{id}", async Task<ApiResult> (SessionId id, IMediator mediator)
            => await mediator.Send(new RevokeSessionCommand { Id = id })
        );

        // Note: This endpoint must be called with the refresh token as Bearer token in the Authorization header.
        // Internal-only endpoint (BlockInternalApiTransform rejects external callers); skips RequireHost so
        // backend-to-backend callers using the cluster's localhost address still reach it.
        routes.MapPost("/internal-api/account/authentication/refresh-authentication-tokens", async Task<ApiResult> (IMediator mediator)
            => await mediator.Send(new RefreshAuthenticationTokensCommand())
        ).WithGroupName(OpenApiDocumentNames.Account).DisableAntiforgery();
    }
}
