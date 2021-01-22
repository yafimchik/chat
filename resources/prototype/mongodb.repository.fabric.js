const MongodbRepository = require("./mongodb.repository");

class MongodbRepositoryFabric {
  constructor(mongodbResourceConfig) {
    this.config = mongodbResourceConfig;
    this.modelConfigs = {};
    this.cruds = {};
    this.models = {};

    this.config.resourceConfigs.forEach(resourceConfig => {
      this.models[resourceConfig.modelName] = resourceConfig.modelConfig.Model;
      this.cruds[resourceConfig.modelName] = new resourceConfig.Crud(resourceConfig.modelConfig, this.models);
      this.modelConfigs[resourceConfig.modelName] = resourceConfig.modelConfig;
      this.cruds[resourceConfig.modelName].getCrud = this.getCrud.bind(this);
    });

  }

  create(modelName, processedModels = []) {
    const repository = new MongodbRepository(
      this.getCrud(modelName),
      this.getModel(modelName),
      modelName,
      this.getModelConfig(modelName),
      processedModels,
      this.create.bind(this),
    );

    return repository;
  }

  getModelConfig(name) {
    return this.modelConfigs[name];
  }

  getCrud(name) {
    return this.cruds[name];
  }

  getModel(name) {
    console.log(name);
    return this.modelConfigs[name].Model;
  }
}

module.exports = MongodbRepositoryFabric;
