using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;

namespace SharedKernel.Authentication.BackOfficeIdentity;

public sealed class BackOfficeGroupRequirement : IAuthorizationRequirement;

// Authorization handler enforcing the optional group-claim restriction. When BackOffice:GroupId is unset,
// any authenticated principal succeeds. When set, the principal must have a 'groups' claim matching the
// configured value; otherwise authorization fails (which the handler turns into 302 to /access-denied for
// browser requests or 403 for API requests).
public sealed class BackOfficeGroupAuthorizationHandler(IOptions<BackOfficeHostOptions> options)
    : AuthorizationHandler<BackOfficeGroupRequirement>
{
    private readonly BackOfficeHostOptions _options = options.Value;

    protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, BackOfficeGroupRequirement requirement)
    {
        if (string.IsNullOrWhiteSpace(_options.GroupId))
        {
            context.Succeed(requirement);
            return Task.CompletedTask;
        }

        var hasGroup = context.User.Claims.Any(claim =>
            claim.Type == BackOfficeIdentityDefaults.GroupsClaimType &&
            string.Equals(claim.Value, _options.GroupId, StringComparison.Ordinal)
        );

        if (hasGroup) context.Succeed(requirement);
        return Task.CompletedTask;
    }
}
