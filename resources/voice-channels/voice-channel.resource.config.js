const voiceChannelModelConfig = require('./voice-channel.model');
const VoiceChannelCrudMongoDb = require('./voice-channel.crud.mongodb');
const VoiceChannelService = require('./voice-channel.service');

const voiceChannelResourceConfig = {
  modelConfig: voiceChannelModelConfig,
  Crud: VoiceChannelCrudMongoDb,
  Service: VoiceChannelService,
  modelName: voiceChannelModelConfig.modelName,
};

module.exports = voiceChannelResourceConfig;
