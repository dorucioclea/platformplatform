using JetBrains.Annotations;
using Mapster;
using PlatformPlatform.AccountManagement.Application.Tenants.Commands;
using PlatformPlatform.AccountManagement.Application.Tenants.Queries;
using PlatformPlatform.AccountManagement.Domain.Tenants;

namespace PlatformPlatform.AccountManagement.Application.Tenants.Dtos;

/// <summary>
///     A shared DTO for used both in <see cref="GetTenantQuery" /> and <see cref="CreateTenantCommand" />.
///     This class is returned by the WebAPI, making it a public contract, so it should be changed with care.
/// </summary>
[UsedImplicitly]
public sealed record TenantDto
{
    /// <summary>
    ///     The Id of the Tenant.
    /// </summary>
    public required string Id { get; init; }

    /// <summary>
    ///     The date and time when the Tenant was created in UTC format.
    /// </summary>
    public required DateTime CreatedAt { get; init; }

    /// <summary>
    ///     The date and time when the Tenant was last modified in UTC format.
    /// </summary>
    [UsedImplicitly]
    public required DateTime? ModifiedAt { get; init; }

    /// <summary>
    ///     The name of the Tenant.
    /// </summary>
    public required string Name { get; init; }

    /// <summary>
    ///     The state of the Tenant (Trial, Active, Suspended).
    /// </summary>
    [UsedImplicitly]
    public TenantState State { get; init; }

    /// <summary>
    ///     The email of the tenant owner.
    /// </summary>
    public required string Email { get; init; }

    /// <summary>
    ///     The phone number of the tenant owner (optional).
    /// </summary>
    public string? Phone { get; init; }

    internal static void ConfigureTenantDtoMapping()
    {
        TypeAdapterConfig<Tenant, TenantDto>.NewConfig()
            .Map(destination => destination.Id, source => source.Id.AsRawString());
    }
}