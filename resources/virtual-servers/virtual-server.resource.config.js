const VirtualServerCrudMongodb = require("./virtual-server.crud.mongodb");
const virtualServerModelConfig = require("./virtual-server.model");
const VirtualServerService = require("./virtual-server.service");

const virtualServerResourceConfig = {
  modelConfig: virtualServerModelConfig,
  Crud: VirtualServerCrudMongodb,
  Service: VirtualServerService,
  modelName: virtualServerModelConfig.modelName,
};

module.exports = virtualServerResourceConfig;

