namespace SharedKernel.Authentication.BackOfficeIdentity;

public static class BackOfficeIdentityDefaults
{
    public const string AuthenticationScheme = "BackOfficeIdentity";

    // Authorization policy that combines the BackOfficeIdentity scheme with the optional group-claim
    // requirement. Distinct name from the scheme so callers reading RequireAuthorization(...) see
    // a policy reference instead of an ambiguous scheme-or-policy string.
    public const string PolicyName = "BackOfficePolicy";

    public const string PrincipalNameHeader = "X-MS-CLIENT-PRINCIPAL-NAME";

    public const string PrincipalIdHeader = "X-MS-CLIENT-PRINCIPAL-ID";

    public const string PrincipalPayloadHeader = "X-MS-CLIENT-PRINCIPAL";

    public const string GroupsClaimType = "groups";

    public const string LoginPath = "/.auth/login/aad";

    public const string CallbackPath = "/.auth/login/aad/callback";

    public const string LogoutPath = "/.auth/logout";

    public const string AccessDeniedPath = "/access-denied";
}
