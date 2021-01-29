const mongoose = require('mongoose');
const relations = require("../prototype/relation.types");

const modelType = {
  message: { type: mongoose.Schema.Types.ObjectId, ref: 'message' },
  audio: {
    type: String,
    required: true,
    unique: false,
  },
  type: {
    type: String,
    required: true,
  },
};

const modelSchema = new mongoose.Schema(modelType, { id: false });

const modelName = 'audio';

const audioModelConfig = {
  modelName: modelName,
  populatedProperties: [
    {
      name: 'message',
      modelName: 'message',
      relation: relations.manyToOne,
      relatedProperty: undefined,
    },
  ],
  Model: mongoose.model(modelName, modelSchema),
  properties: Object.keys(modelType).concat('_id'),
};

module.exports = audioModelConfig;
