const MessageCrudMongodb = require('./message.crud.mongodb');
const messageModelConfig = require('./message.model');
const MessageService = require('./message.service');

const messageResourceConfig = {
  modelConfig: messageModelConfig,
  Crud: MessageCrudMongodb,
  Service: MessageService,
  modelName: messageModelConfig.modelName,
};

module.exports = messageResourceConfig;
