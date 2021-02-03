const fileModelConfig = require('./file.model');
const FileCrudMongodb = require('./file.crud.mongodb');
const FileService = require('./file.service');

const fileResourceConfig = {
  modelConfig: fileModelConfig,
  Crud: FileCrudMongodb,
  Service: FileService,
  modelName: fileModelConfig.modelName,
};

module.exports = fileResourceConfig;
