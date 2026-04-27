using SharedKernel.Configuration;
using Yarp.ReverseProxy.Configuration;

namespace AppGateway.Filters;

public class ClusterDestinationConfigFilter(PortAllocation ports) : IProxyConfigFilter
{
    public ValueTask<ClusterConfig> ConfigureClusterAsync(ClusterConfig cluster, CancellationToken cancel)
    {
        // Production deploys (Bicep) set the full URL via {SERVICE}_API_URL environment variables;
        // that takes priority. Local dev gets ports from PortAllocation and composes https://localhost:{port}.
        var address = cluster.ClusterId switch
        {
            "account-api" => ResolveAddress("ACCOUNT_API_URL", ports.AccountApi),
            "account-static" => ResolveAddress("ACCOUNT_API_URL", ports.AccountStatic),
            "account-storage" => ResolveStorageAddress("ACCOUNT_STORAGE_URL", ports.Blob),
            "back-office-api" => ResolveAddress("BACK_OFFICE_API_URL", ports.BackOfficeApi),
            "back-office-static" => ResolveAddress("BACK_OFFICE_API_URL", ports.BackOfficeStatic),
            "back-office-storage" => ResolveStorageAddress("BACK_OFFICE_STORAGE_URL", ports.Blob),
            "main-api" => ResolveAddress("MAIN_API_URL", ports.MainApi),
            "main-static" => ResolveAddress("MAIN_API_URL", ports.MainStatic),
            "main-storage" => ResolveStorageAddress("MAIN_STORAGE_URL", ports.Blob),
            _ => throw new InvalidOperationException($"Unknown Cluster ID {cluster.ClusterId}.")
        };

        var destination = cluster.Destinations!.Single();
        var newDestinations = new Dictionary<string, DestinationConfig>(StringComparer.OrdinalIgnoreCase)
        {
            { destination.Key, destination.Value with { Address = address } }
        };
        return new ValueTask<ClusterConfig>(cluster with { Destinations = newDestinations });
    }

    public ValueTask<RouteConfig> ConfigureRouteAsync(RouteConfig route, ClusterConfig? cluster, CancellationToken cancel)
    {
        return new ValueTask<RouteConfig>(route);
    }

    private static string ResolveAddress(string productionUrlEnvironmentVariableName, int developmentPort)
    {
        var productionUrl = Environment.GetEnvironmentVariable(productionUrlEnvironmentVariableName);
        if (!string.IsNullOrEmpty(productionUrl)) return productionUrl;
        return $"https://localhost:{developmentPort}";
    }

    private static string ResolveStorageAddress(string productionUrlEnvironmentVariableName, int blobPort)
    {
        var productionUrl = Environment.GetEnvironmentVariable(productionUrlEnvironmentVariableName);
        if (!string.IsNullOrEmpty(productionUrl)) return productionUrl;
        return $"http://127.0.0.1:{blobPort}/devstoreaccount1";
    }
}
