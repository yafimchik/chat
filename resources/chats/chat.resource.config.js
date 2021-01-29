const chatModelConfig = require('./chat.model');
const ChatCrudMongoDb = require('./chat.crud.mongodb');
const ChatService = require('./chat.service');

const chatResourceConfig = {
  modelConfig: chatModelConfig,
  Crud: ChatCrudMongoDb,
  Service: ChatService,
  modelName: chatModelConfig.modelName,
};

module.exports = chatResourceConfig;
