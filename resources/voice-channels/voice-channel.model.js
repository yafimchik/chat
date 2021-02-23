const mongoose = require('mongoose');
const relations = require('../prototype/relation.types');
const relationActionTypes = require('../prototype/relation-action.types');

const modelType = {
  name: {
    type: String,
    required: true,
    unique: true,
  },
  chat: { type: mongoose.Schema.Types.ObjectId, ref: 'chat' },
  virtualServer: { type: mongoose.Schema.Types.ObjectId, ref: 'virtualServer', required: true },
};

const modelSchema = new mongoose.Schema(modelType, { id: false });

const modelName = 'voiceChannel';

const voiceChannelModelConfig = {
  modelName: modelName,
  populatedProperties: [
    {
      name: 'chat',
      modelName: 'chat',
      relation: relations.oneToOne,
      onDelete: relationActionTypes.cascade,
      onUpdate: relationActionTypes.nothing,
      relatedProperty: undefined,
    },
    {
      name: 'virtualServer',
      modelName: 'virtualServer',
      relation: relations.manyToOne,
      relatedProperty: undefined,
    },
  ],
  Model: mongoose.model(modelName, modelSchema),
  properties: Object.keys(modelType).concat('_id'),
};

module.exports = voiceChannelModelConfig;
