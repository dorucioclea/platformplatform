using System.Security.Claims;
using JetBrains.Annotations;
using Microsoft.AspNetCore.Http;
using SharedKernel.Authentication.BackOfficeIdentity;
using SharedKernel.Cqrs;

namespace Account.Features.BackOffice.Queries;

[PublicAPI]
public sealed record GetMeQuery : IRequest<Result<MeResponse>>;

[PublicAPI]
public sealed record MeResponse(string DisplayName, string[] Groups);

// Reaches into HttpContext.User directly rather than going through IExecutionContext because back-office
// principals (Easy Auth / mock easy auth) carry no UserId, TenantId, or SessionId — IExecutionContext.UserInfo
// is shaped for tenant-scoped account users and would lose the BackOfficeIdentity claim shape we need here.
public sealed class GetMeHandler(IHttpContextAccessor httpContextAccessor) : IRequestHandler<GetMeQuery, Result<MeResponse>>
{
    public Task<Result<MeResponse>> Handle(GetMeQuery query, CancellationToken cancellationToken)
    {
        // The route group requires authorization, so HttpContext.User is always an authenticated BackOfficeIdentity here.
        var principal = httpContextAccessor.HttpContext!.User;
        var displayName = principal.FindFirstValue(ClaimTypes.Name) ?? string.Empty;
        var groups = principal.Claims
            .Where(claim => claim.Type == BackOfficeIdentityDefaults.GroupsClaimType)
            .Select(claim => claim.Value)
            .ToArray();

        return Task.FromResult<Result<MeResponse>>(new MeResponse(displayName, groups));
    }
}
