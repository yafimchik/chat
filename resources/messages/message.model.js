const mongoose = require('mongoose');
const relations = require('../prototype/relation.types');
const relationActionTypes = require('../prototype/relation-action.types');

const modelType = {
  text: {
    type: String,
    required: true,
    unique: false,
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  chat: { type: mongoose.Schema.Types.ObjectId, ref: 'chat' },
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
    {
      name: undefined,
      modelName: 'audio',
      relation: relations.oneToMany,
      onDelete: relationActionTypes.cascade,
      onUpdate: relationActionTypes.nothing,
      relatedProperty: 'message',
    },
    {
      name: undefined,
      modelName: 'file',
      relation: relations.oneToMany,
      onDelete: relationActionTypes.cascade,
      onUpdate: relationActionTypes.nothing,
      relatedProperty: 'message',
    },
  ],
  Model: mongoose.model(modelName, modelSchema),
  properties: Object.keys(modelType).concat('_id'),
};

module.exports = messageModelConfig;
