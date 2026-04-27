namespace AppHost;

public static class ConfigurationExtensions
{
    extension<TDestination>(IResourceBuilder<TDestination> builder) where TDestination : IResourceWithEnvironment
    {
        public IResourceBuilder<TDestination> WithUrlConfiguration(string hostname, string applicationBasePath)
        {
            var baseUrl = $"https://{hostname}:9000";
            applicationBasePath = applicationBasePath.TrimEnd('/');

            return builder
                .WithEnvironment("PUBLIC_URL", baseUrl)
                .WithEnvironment("CDN_URL", baseUrl + applicationBasePath);
        }
    }
}
