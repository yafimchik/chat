const BadRequestError = require('../../errors/bad-request.error');
const Crud = require("./crud");
const mongoose = require("mongoose");
const relationTypes = require("./relation.types");

class CrudMongodb extends Crud {
  constructor({Model, properties, populatedProperties }, ModelsAll) {
    super();
    this.ModelsAll = ModelsAll;
    this.Model = Model;
    this.propsArray = properties;
    this.populatePropsArray = populatedProperties;
  }

  get props() {
    return this.propsArray.join(' ');
  }

  populateProps(query, populateProps) {
    const populate = (populateProps !== undefined) ? populateProps : this.populatePropsArray;
    if (populate) {
      populate.forEach(prop => {
        if (prop.relation !== relationTypes.manyToMany) query.populate(prop.name);
      });
    }
    return query;
  }

  async getAll(populateProps) {
    return this.getWhere(undefined, populateProps);
  }

  async getWhere(condition, populateProps) {
    const query = this.Model
      .find(condition)
      .select(this.props);
    this.populateProps(query, populateProps);

    return query.populate().lean().exec();
  }

  async getById(id, populateProps) {
    const query = this.Model
      .findById(id)
      .select(this.props);

    this.populateProps(query, populateProps);

    return query.lean().exec();
  }

  async populatePropertiesInObject(obj, populateProps) {
    if (!this.ModelsAll) return obj;
    const populate = populateProps !== undefined ? populateProps : this.populatePropsArray;
    let result = {...obj};

    for (let prop of populate) {
      if (!prop.name) continue;
      if (!obj[prop.name]) continue;
      if (obj[prop.name] instanceof Array) {
        result[prop.name] = await Promise.all(obj[prop.name].map(id => this.ModelsAll[prop.modelName].findById(id).exec()));
        result[prop.name] = result[prop.name].filter(item => item);
      } else {
        result[prop.name] = (await this.ModelsAll[prop.modelName].findById(obj[prop.name]).exec());
        if (!result[prop.name]) delete result[prop.name];
      }
    }

    return result;
  }

  async create(obj, populateProps) {
    if (typeof obj !== 'object') {
      return null;
    }

    const newRecord = new this.Model(await this.populatePropertiesInObject(obj, populateProps));

    let result = await CrudMongodb.safeWrite(newRecord.save());

    result = CrudMongodb.handleMongodbErrors(result);

    return result ? result.toObject() : result;
  }

  async update(id, obj, populateProps) {
    const result = await CrudMongodb.safeWrite(
      this.Model.findByIdAndUpdate(id, await this.populatePropertiesInObject(obj, populateProps)).lean().exec(),
    );
    return result;
  }

  async deleteById(id, populateProps) {
    const result = await this.Model.findByIdAndDelete(id).exec();
    return result;
  }

  static async safeWrite(action) {
    try {
      return await action;
    } catch (err) {
      return CrudMongodb.handleMongodbErrors(err);
    }
  }

  static handleMongodbErrors(result) {
    if (result && result.driver && result.code === 11000) {
      throw new BadRequestError(
        `${Object.keys(result.keyValue)
          .join(', ')
          .toUpperCase()} must be unique`,
      );
    }
    if (result.errors) {
      console.log(result);
      throw new BadRequestError(
        result._message,
      );
    }
    return result;
  }
}

module.exports = CrudMongodb;
