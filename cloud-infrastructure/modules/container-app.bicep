param name string
param location string
param tags object
param resourceGroupName string
param environmentName string
param environmentId string
param containerRegistryName string
param containerImageName string
param containerImageTag string
param cpu string = '0.25'
param memory string = '0.5Gi'
param sqlServerName string
param sqlDatabaseName string
param userAssignedIdentityName string
param customDomainName string

resource userAssignedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' existing = {
  scope: resourceGroup(resourceGroupName)
  name: userAssignedIdentityName
}

var containerRegistryResourceGroupName = 'shared'
module containerRegistryPermission './container-registry-permission.bicep' = {
  name: 'container-registry-permission'
  scope: resourceGroup(subscription().subscriptionId, containerRegistryResourceGroupName)
  params: {
    containerRegistryName: containerRegistryName
    identityPrincipalId: userAssignedIdentity.properties.principalId
  }
}

resource containerAppsEnvironment 'Microsoft.App/managedEnvironments@2023-05-01' existing = {
  scope: resourceGroup(resourceGroupName)
  name: environmentName
}

module managedCertificate './managed-certificate.bicep' = {
  name: '${containerAppsEnvironment.name}-certificate-module'
  scope: resourceGroup(resourceGroupName)
  params: {
    environmentName: containerAppsEnvironment.name
    location: location
    tags: tags
    customDomainName: customDomainName
  }
}

var containerRegistryServerUrl = '${containerRegistryName}.azurecr.io'
resource containerApp 'Microsoft.App/containerApps@2023-04-01-preview' = {
  name: name
  location: location
  tags: tags
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${userAssignedIdentity.id}': {}
    }
  }
  properties: {
    environmentId: environmentId
    template: {
      containers: [
        {
          name: name
          image: '${containerRegistryServerUrl}/${containerImageName}:${containerImageTag}'
          resources: {
            cpu: json(cpu)
            memory: memory
          }
          env: [
            {
              name: 'AZURE_SQL_SERVER_NAME'
              value: sqlServerName
            }
            {
              name: 'AZURE_SQL_DATABASE_NAME'
              value: sqlDatabaseName
            }
            {
              name: 'MANAGED_IDENTITY_CLIENT_ID'
              value: userAssignedIdentity.properties.clientId
            }
          ]
        }
      ]
      scale: {
        minReplicas: 0
      }
    }
    configuration: {
      registries: [
        {
          server: containerRegistryServerUrl
          identity: userAssignedIdentity.id
        }
      ]
      ingress: {
        external: true
        targetPort: 8443
        exposedPort: 0
        allowInsecure: false
        traffic: [
          {
            latestRevision: true
            weight: 100
          }
        ]
        customDomains: [
          {
            bindingType: 'SniEnabled'
            certificateId: managedCertificate.outputs.certificateId
            name: 'dev-api.platformplatform.net'  
          }
        ]
        stickySessions: null
      }
    }
  }
  dependsOn: [containerRegistryPermission]
}
