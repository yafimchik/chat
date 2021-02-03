const repositoryFabric = require("./repository.fabric");
const mongodbResourceConfig = require("./mongodb.resource.config");

class ServiceFabric {
  constructor(resourceConfig, repositoryFabric) {
    this.config = resourceConfig;
    this.repositoryFabric = repositoryFabric;
    this.services = {};
  }

  create(modelName) {
    if (this.services[modelName]) return this.services[modelName];
    const repository = this.repositoryFabric.create(modelName);
    const currentConfig = this.config.resourceConfigs
      .find(resourceConfig => resourceConfig.modelName === modelName);
    if (!currentConfig) return;
    this.services[modelName] = new currentConfig.Service(repository);
    return this.services[modelName];
  }
}

const serviceFabric = new ServiceFabric(mongodbResourceConfig, repositoryFabric);

module.exports = serviceFabric;
