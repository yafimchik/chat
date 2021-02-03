const mongoose = require('mongoose');
const relations = require("../prototype/relation.types");

const modelType = {
  message: { type: mongoose.Schema.Types.ObjectId, ref: 'message' },
  file: {
    type: Buffer,
    required: true,
  },
  filename: {
    type: String,
    default: 'file',
  },
  size: {
    type: Number,
    required: true,
  },
};

const modelSchema = new mongoose.Schema(modelType, { id: false });

const modelName = 'file';

const fileModelConfig = {
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

module.exports = fileModelConfig;
