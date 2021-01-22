const mongoose = require('mongoose');
const chatModelConfig = require("../chats/chat.model");
const userModelConfig = require("../users/user.model");
const relations = require("../prototype/relation.types");
const relationActionTypes = require("../prototype/relation-action.types");

const modelType = {
  name: {
    type: String,
    required: true,
    unique: true,
  },
};

const modelSchema = new mongoose.Schema(modelType, { id: false });

const modelName = 'virtualServer';

const virtualServerModelConfig = {
  modelName: modelName,
  populatedProperties: [
    {
      name: undefined,
      modelName: 'chat',
      relation: relations.oneToMany,
      onDelete: relationActionTypes.cascade,
      onUpdate: relationActionTypes.nothing,
      relatedProperty: 'virtualServer',
    },
    {
      name: undefined,
      modelName: 'user',
      relation: relations.manyToMany,
      onDelete: relationActionTypes.null,
      onUpdate: relationActionTypes.nothing,
      relatedProperty: 'virtualServers',
    },
  ],
  Model:  mongoose.model(modelName, modelSchema),
  properties: Object.keys(modelType).concat('_id'),
};

module.exports = virtualServerModelConfig;
