param environmentName string
param location string
param tags object
param customDomainName string

resource managedEnvironmentManagedCertificate 'Microsoft.App/managedEnvironments/managedCertificates@2023-05-01' = {
  name: '${environmentName}-certificate'
  location: location
  tags: tags
  properties: {
    subjectName: customDomainName
    domainControlValidation: 'CNAME'
  }
}

output certificateId string = managedEnvironmentManagedCertificate.id
