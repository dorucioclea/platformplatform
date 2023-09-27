targetScope = 'subscription'

param environment string
param locationPrefix string
param resourceGroupName string
param clusterUniqueName string
param useMssqlElasticPool bool
param containerRegistryName string
param location string = deployment().location
param sqlAdminObjectId string

var tags = { environment: environment, 'managed-by': 'bicep' }
var diagnosticStorageAccountName = '${clusterUniqueName}diagnostic'

// Manually construct virtual network subnetId to avoid dependent Bicep resources to be ignored. See https://github.com/Azure/arm-template-whatif/issues/157#issuecomment-1336139303
var virtualNetworkName = '${locationPrefix}-virtual-network'
var subnetId = resourceId(
  subscription().subscriptionId,
  resourceGroupName,
  'Microsoft.Network/virtualNetworks/subnets',
  virtualNetworkName,
  'subnet'
)

resource existingLogAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2022-10-01' existing = {
  scope: resourceGroup('${environment}')
  name: '${environment}-log-analytics-workspace'
}

resource clusterResourceGroup 'Microsoft.Resources/resourceGroups@2022-09-01' = {
  name: resourceGroupName
  location: location
  tags: tags
}

module diagnosticStorageAccount '../modules/storage-account.bicep' = {
  scope: clusterResourceGroup
  name: 'diagnostic-storage-account'
  params: {
    location: location
    name: diagnosticStorageAccountName
    sku: 'Standard_GRS'
    tags: tags
  }
}

module virtualNetwork '../modules/virtual-network.bicep' = {
  scope: clusterResourceGroup
  name: 'virtual-network'
  params: {
    location: location
    name: virtualNetworkName
    tags: tags
  }
}

module keyVault '../modules/key-vault.bicep' = {
  scope: clusterResourceGroup
  name: 'key-vault'
  params: {
    location: location
    name: clusterUniqueName
    tags: tags
    tenantId: subscription().tenantId
    subnetId: subnetId
    storageAccountId: diagnosticStorageAccount.outputs.storageAccountId
    workspaceId: existingLogAnalyticsWorkspace.id
  }
  dependsOn: [virtualNetwork]
}

module serviceBus '../modules/service-bus.bicep' = {
  scope: clusterResourceGroup
  name: 'service-bus'
  params: {
    location: location
    name: clusterUniqueName
    tags: tags
    storageAccountId: diagnosticStorageAccount.outputs.storageAccountId
    workspaceId: existingLogAnalyticsWorkspace.id
  }
}

module microsoftSqlServer '../modules/microsoft-sql-server.bicep' = {
  scope: clusterResourceGroup
  name: 'microsoft-sql-server'
  params: {
    location: location
    name: clusterUniqueName
    tags: tags
    subnetId: subnetId
    tenantId: subscription().tenantId
    sqlAdminObjectId: sqlAdminObjectId
  }
  dependsOn: [virtualNetwork]
}

module microsoftSqlDerverDiagnosticConfiguration '../modules/microsoft-sql-server-diagnostic.bicep' = {
  scope: clusterResourceGroup
  name: 'microsoft-sql-server-diagnostic'
  params: {
    diagnosticStorageAccountName: diagnosticStorageAccountName
    microsoftSqlServerName: clusterUniqueName
    principalId: microsoftSqlServer.outputs.principalId
    dianosticStorageAccountBlobEndpoint: diagnosticStorageAccount.outputs.blobEndpoint
    dianosticStorageAccountSubscriptionId: subscription().subscriptionId
  }
}

module microsoftSqlServerElasticPool '../modules/microsoft-sql-server-elastic-pool.bicep' =
  if (useMssqlElasticPool) {
    scope: clusterResourceGroup
    name: 'microsoft-sql-server-elastic-pool'
    params: {
      location: location
      name: '${locationPrefix}-microsoft-sql-server-elastic-pool'
      tags: tags
      sqlServerName: clusterUniqueName
      skuName: 'BasicPool'
      skuTier: 'Basic'
      skuCapacity: 50
      maxDatabaseCapacity: 5
    }
  }

module accountManagementDatabase '../modules/microsoft-sql-database.bicep' = {
  name: 'account-management-database'
  scope: clusterResourceGroup
  params: {
    sqlServerName: clusterUniqueName
    databaseName: 'account-management'
    location: location
    tags: tags
  }
  dependsOn: [microsoftSqlServer]
}

module contaionerAppsEnvironment '../modules/container-apps-environment.bicep' = {
  scope: clusterResourceGroup
  name: 'container-apps-environment'
  params: {
    location: location
    name: '${locationPrefix}-container-apps-environment'
    tags: tags
    subnetId: subnetId
  }
  dependsOn: [virtualNetwork]
}

module accountManagementIdentity '../modules/user-assigned-managed-identity.bicep' = {
  name: 'account-management-managed-identity'
  scope: clusterResourceGroup
  params: {
    name: 'account-management-${resourceGroupName}'
    location: location
    tags: tags
  }
}

module accountManagementApi '../modules/container-app.bicep' = {
  name: 'account-management-api'
  scope: clusterResourceGroup
  params: {
    name: 'account-management-api'
    location: location
    tags: tags
    resourceGroupName: resourceGroupName
    environmentId: contaionerAppsEnvironment.outputs.environmentId
    containerRegistryName: containerRegistryName
    containerImageName: 'account-management-api'
    containerImageTag: 'latest'
    cpu: '0.25'
    memory: '0.5Gi'
    sqlServerName: clusterUniqueName
    sqlDatabaseName: 'account-management'
    userAssignedIdentityName: 'account-management-${resourceGroupName}'
    customDomainName: 'dev-api.platformplatform.net'
    environmentName: contaionerAppsEnvironment.name
  }
  dependsOn: [accountManagementDatabase]
}

output accountManagementIdentityClientId string = accountManagementIdentity.outputs.clientId
