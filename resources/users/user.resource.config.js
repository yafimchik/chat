const userModelConfig = require("./user.model");
const UserCrudMongodb = require("./user.crud.mongodb");
const UserService = require("./user.service");

const userResourceConfig = {
  modelConfig: userModelConfig,
  Crud: UserCrudMongodb,
  Service: UserService,
  modelName: userModelConfig.modelName,
};

module.exports = userResourceConfig;
