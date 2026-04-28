using Account.Features.Tenants.Commands;
using Account.Features.Tenants.Queries;
using SharedKernel.ApiResults;
using SharedKernel.Domain;
using SharedKernel.Endpoints;
using SharedKernel.OpenApi;

namespace Account.Api.Endpoints;

public sealed class TenantEndpoints : IEndpoints
{
    private const string RoutesPrefix = "/api/account/tenants";

    public void MapEndpoints(IEndpointRouteBuilder routes)
    {
        var appHost = routes.ServiceProvider.GetRequiredService<IConfiguration>()["Hostnames:App"]!;

        var group = routes.MapGroup(RoutesPrefix).WithTags("Tenants").WithGroupName(OpenApiDocumentNames.Account).RequireHost(appHost).RequireAuthorization().ProducesValidationProblem();

        group.MapGet("/current", async Task<ApiResult<TenantResponse>> (IMediator mediator)
            => await mediator.Send(new GetCurrentTenantQuery())
        ).Produces<TenantResponse>();

        group.MapPut("/current", async Task<ApiResult> (UpdateCurrentTenantCommand command, IMediator mediator)
            => (await mediator.Send(command)).AddRefreshAuthenticationTokens()
        );

        group.MapGet("/", async Task<ApiResult<GetTenantsForUserResponse>> (IMediator mediator)
            => await mediator.Send(new GetTenantsForUserQuery())
        ).Produces<GetTenantsForUserResponse>();

        group.MapPost("/current/update-logo", async Task<ApiResult> (IFormFile file, IMediator mediator)
            => await mediator.Send(new UpdateTenantLogoCommand(file.OpenReadStream(), file.ContentType))
        ).DisableAntiforgery();

        group.MapDelete("/current/remove-logo", async Task<ApiResult> (IMediator mediator)
            => await mediator.Send(new RemoveTenantLogoCommand())
        );

        // Internal-only endpoint (BlockInternalApiTransform rejects external callers); skips RequireHost so
        // backend-to-backend callers using the cluster's localhost address still reach it.
        routes.MapDelete("/internal-api/account/tenants/{id}", async Task<ApiResult> (TenantId id, IMediator mediator)
            => await mediator.Send(new DeleteTenantCommand(id))
        ).WithGroupName(OpenApiDocumentNames.Account);
    }
}
