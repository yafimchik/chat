const mongoose = require('mongoose');
const chatModelConfig = require("../chats/chat.model");
const userModelConfig = require("../users/user.model");
const relations = require("../prototype/relation.types");

const modelType = {
  text: {
    type: String,
    required: true,
    unique: false,
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: userModelConfig.Model },
  chat: { type: mongoose.Schema.Types.ObjectId, ref: chatModelConfig.Model },
  date: Date,
};

const modelSchema = new mongoose.Schema(modelType, { id: false });

const modelName = 'message';

const messageModelConfig = {
  modelName: modelName,
  populatedProperties: [
    {
      name: 'chat',
      modelName: 'chat',
      relation: relations.manyToOne,
      relatedProperty: undefined,
    },
    {
      name: 'user',
      modelName: 'user',
      relation: relations.manyToOne,
      relatedProperty: undefined,
    },
  ],
  Model: mongoose.model(modelName, modelSchema),
  properties: Object.keys(modelType).concat('_id'),
};

module.exports = messageModelConfig;
