const chatResourceConfig = require('./chats/chat.resource.config');
const messageResourceConfig = require('./messages/message.resource.config');
const userResourceConfig = require('./users/user.resource.config');
const virtualServerResourceConfig = require('./virtual-servers/virtual-server.resource.config');
const fileResourceConfig = require('./files/file.resource.config');
const audioResourceConfig = require('./audios/audio.resource.config');

const mongodbResourceConfig = {
  resourceConfigs: [
    chatResourceConfig,
    messageResourceConfig,
    userResourceConfig,
    virtualServerResourceConfig,
    fileResourceConfig,
    audioResourceConfig,
  ],
};

module.exports = mongodbResourceConfig;
