const mongoose = require('mongoose');
const relations = require('../prototype/relation.types');

const modelType = {
  name: {
    type: String,
    required: true,
    unique: true,
  },
  virtualServer: { type: mongoose.Schema.Types.ObjectId, ref: 'virtualServer', required: true },
};

const modelSchema = new mongoose.Schema(modelType, { id: false });

const modelName = 'voiceChannel';

const voiceChannelModelConfig = {
  modelName: modelName,
  populatedProperties: [
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
