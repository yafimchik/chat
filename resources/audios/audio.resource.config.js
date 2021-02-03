const audioModelConfig = require('./audio.model');
const AudioCrudMongodb = require('./audio.crud.mongodb');
const AudioService = require('./audio.service');

const audioResourceConfig = {
  modelConfig: audioModelConfig,
  Crud: AudioCrudMongodb,
  Service: AudioService,
  modelName: audioModelConfig.modelName,
};

module.exports = audioResourceConfig;
