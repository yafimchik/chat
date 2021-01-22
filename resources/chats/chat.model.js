const mongoose = require('mongoose');
const virtualServerModelConfig = require("../virtual-servers/virtual-server.model");
const relations = require("../prototype/relation.types");
const relationActionTypes = require("../prototype/relation-action.types");

const modelType = {
  name: {
    type: String,
    required: true,
    unique: true,
  },
  virtualServer: { type: mongoose.Schema.Types.ObjectId, ref: virtualServerModelConfig.Model, required: true },
};

const modelSchema = new mongoose.Schema(modelType, { id: false });

const modelName = 'chat';

const chatModelConfig = {
  modelName: modelName,
  populatedProperties: [
    {
      name: 'virtualServer',
      modelName: 'virtualServer',
      relation: relations.manyToOne,
      relatedProperty: undefined,
    },
    {
      name: undefined,
      modelName: 'message',
      relation: relations.oneToMany,
      onDelete: relationActionTypes.cascade,
      onUpdate: relationActionTypes.nothing,
      relatedProperty: 'chat',
    },
  ],
  Model: mongoose.model(modelName, modelSchema),
  properties: Object.keys(modelType).concat('_id'),
};

module.exports = chatModelConfig;
