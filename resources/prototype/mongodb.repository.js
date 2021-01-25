const Crud = require("./crud");
const relationTypes = require("./relation.types");
const relationActionTypes = require("./relation-action.types");
const mongoose = require("mongoose");
const BadMongoModelError = require("../../errors/bad-mongo-model.error");

class MongodbRepository extends Crud {
  constructor(crud, Model, modelName, modelConfig, processedModels, fnCreateRepository) {
    super();

    this.modelConfig = modelConfig;
    this.modelName = modelName;
    this.crud = crud;
    this.processedModels = processedModels;

    this.createRepository = fnCreateRepository;

    this.getAll = this.crud.getAll.bind(this.crud);
    this.getWhere = this.crud.getWhere.bind(this.crud);
    this.getWhereByOrderLimitOffset = this.crud.getWhereByOrderLimitOffset.bind(this.crud);
    this.getById = this.crud.getById.bind(this.crud);

    Object.keys(this.crud).forEach(key => {
      if (!this.crud[key]) return;
      if (typeof this.crud[key] !== 'function') return;
      this[key] = this.crud[key].bind(this.crud);
    });
  }

  checkPopulatedProperties(object) {
    const objectForSave = { ...object };

    const { populatedProperties } = this.modelConfig;
    populatedProperties.forEach(property => {
      if (!property.name) return;
      if (object[property.name] instanceof Array && property.relation !== relationTypes.manyToMany) {
        delete objectForSave[property.name];
      }
    });
    return objectForSave;
  }

  async create(object) {
    return await this.crud.create(this.checkPopulatedProperties(object));
  }

  async update(id, object) {
    return await this.crud.update(id, this.checkPopulatedProperties(object));
  }

  async deleteById(id) {
    if (!id) return false;
    if (typeof id !== 'string') id = id.toString();

    const { populatedProperties } = this.modelConfig;

    for (let property of populatedProperties) {
      if (this.processedModels.includes(property.modelName)) continue;

      let relatedRepository = this.createRepository(
        property.modelName,
        this.processedModels.concat(this.modelName),
      );

      const isOnDeleteCascade = property.onDelete === relationActionTypes.cascade;
      const isOnDeleteNull = property.onDelete === relationActionTypes.null;

      if (!isOnDeleteCascade && !isOnDeleteNull) continue;

      const thisRecord = await this.getById(id, []);

      const isRelationOneToMany = property.relation === relationTypes.oneToMany;
      const isRelationOneToOne = property.relation === relationTypes.oneToOne;
      const isRelationManyToMany = property.relation === relationTypes.manyToMany;

      if (isOnDeleteCascade) {
        if (isRelationOneToMany || isRelationOneToOne) {
          if (!property.relatedProperty) throw new BadMongoModelError(this.modelName);
          const condition = {[property.relatedProperty]: id};
          const idsToDelete = (await relatedRepository.getWhere(condition, [])).map(rec => rec._id);
          await relatedRepository.deleteMany(idsToDelete);
        }
        if (isRelationOneToOne && property.name) {
          await relatedRepository.deleteById(thisRecord[property.name]);
        }
      } else {
        if (isRelationOneToMany || isRelationOneToOne) {
          if (!property.relatedProperty) continue;

          const condition = {[property.relatedProperty]: mongoose.Types.ObjectId(id)};

          const relatedRecordIds = (await relatedRepository.getWhere(condition, []))
            .map(relatedRecord => relatedRecord._id);

          const updateObject = {[property.relatedProperty]: null};
          await relatedRepository.updateMany(relatedRecordIds, updateObject);
        }
        if (isRelationManyToMany) {
          if (!property.relatedProperty) continue;

          const relatedDocuments = (await relatedRepository.getAll([]))
            .filter((record) => {
              if (!record[property.relatedProperty]) return false;
              return (record[property.relatedProperty].some(
                (relatedId) => relatedId === id,
              ));
          });

          await Promise.all(relatedDocuments.map(relatedDocument => {
            const idToUpdate = relatedDocument._id;

            const updateObject = {
              [property.relatedProperty]: relatedDocument[property.relatedProperty]
                .filter((relatedId) => (relatedId !== id)),
            };
            return relatedRepository.update(idToUpdate, updateObject);
          }));
        }
      }
    }
    return await this.crud.deleteById(id);
  }
}

module.exports = MongodbRepository;
