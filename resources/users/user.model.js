const mongoose = require('mongoose');
const relations = require("../prototype/relation.types");
const relationActionTypes = require("../prototype/relation-action.types");

const modelType = {
  username: {
    type: String,
    required: true,
    unique: true,
  },
  virtualServers: [ { type: mongoose.Schema.Types.ObjectId, ref: 'virtualServer' } ],
};

const modelSchema = new mongoose.Schema(modelType, { id: false });

const modelName = 'user';

const userModelConfig = {
  modelName: modelName,
  populatedProperties: [
    {
      name: 'virtualServers',
      modelName: 'virtualServer',
      relation: relations.manyToMany,
      onDelete: relationActionTypes.nothing,
      onUpdate: relationActionTypes.nothing,
      relatedProperty: undefined,
    },
    {
      name: undefined,
      modelName: 'message',
      relation: relations.oneToMany,
      onDelete: relationActionTypes.null,
      onUpdate: relationActionTypes.nothing,
      relatedProperty: 'user',
    },
  ],
  Model:  mongoose.model(modelName, modelSchema),
  properties: Object.keys(modelType).concat('_id'),
};

module.exports = userModelConfig;
