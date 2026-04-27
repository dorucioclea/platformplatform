using System.Collections.Immutable;

namespace SharedKernel.Authentication.MockEasyAuth;

public sealed record MockEasyAuthIdentity(string Id, string Name, string ObjectId, ImmutableArray<string> Groups);

public static class MockEasyAuthIdentities
{
    public static readonly ImmutableArray<MockEasyAuthIdentity> Default =
    [
        new("admin", "Admin User", "00000000-0000-0000-0000-0000000000a1", ["BackOfficeAdmins"]),
        new("support", "Support User", "00000000-0000-0000-0000-0000000000a2", ["BackOfficeSupport"]),
        new("readonly", "Read Only", "00000000-0000-0000-0000-0000000000a3", ["BackOfficeReadOnly"]),
        new("plain", "Plain User", "00000000-0000-0000-0000-0000000000a4", [])
    ];

    public static MockEasyAuthIdentity? Find(string id)
    {
        return Default.FirstOrDefault(identity => string.Equals(identity.Id, id, StringComparison.Ordinal));
    }
}
