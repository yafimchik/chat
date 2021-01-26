const BadRequestError = require('../../errors/bad-request.error');
const Crud = require("./crud");
const relationTypes = require("./relation.types");
const DatabaseError = require("../../errors/database.error");

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
    return this.getWhereByOrderLimitOffset(
      undefined,
      undefined,
      undefined,
      undefined,
      populateProps,
    );
  }

  async getWhere(condition, populateProps) {
    return this.getWhereByOrderLimitOffset(
      condition,
      undefined,
      undefined,
      undefined,
      populateProps,
    );
  }

  async getWhereByOrderLimitOffset(condition, order, limit, offset, populateProps) {
    const query = this.Model
      .find(condition);
    if (order) {
      query.sort(order);
    }
    if (limit !== undefined) {
      query.limit(limit);
    }
    if (offset !== undefined) {
      query.skip(offset);
    }
    query.select(this.props);

    this.populateProps(query, populateProps);

    let result = await query.lean().exec();
    if (result) result = result.map((record) => this.convertIdsToString(record));
    return result;
  }

  convertIdsToString(record) {
    const result = { ...record };
    result._id = record._id.toString();
    this.populatePropsArray.forEach((property) => {
      const key = property.name;
      if (!key) return;
      if (!result[key]) return;
      if (result[key] instanceof Array) {
        result[key] = result[key].map((id) => id ? id.toString() : null);
        result[key] = result[key].filter((id) => id);
      } else {
        result[key] = (result[key]._id) ? result[key]._id.toString() : result[key].toString();
      }
    });
    return result;
  }

  async getById(id, populateProps) {
    const query = this.Model
      .findById(id)
      .select(this.props);

    this.populateProps(query, populateProps);

    const result = await query.lean().exec();
    return this.convertIdsToString(result);
  }

  async populatePropertiesInObject(obj, populateProps) {
    if (!this.ModelsAll) return obj;
    const populate = populateProps !== undefined ? populateProps : this.populatePropsArray;
    let result = {...obj};

    for (let prop of populate) {
      if (!prop.name) continue;
      if (!obj[prop.name]) continue;
      if (obj[prop.name] instanceof Array) {
        result[prop.name] = await Promise.all(obj[prop.name].map(
          (id) => this.ModelsAll[prop.modelName].findById(id).exec()
        ));
        result[prop.name] = result[prop.name].filter(item => item);
      } else {
        result[prop.name] = await this.ModelsAll[prop.modelName].findById(obj[prop.name]).exec();
        if (!result[prop.name]) delete result[prop.name];
      }
    }

    return result;
  }

  async create(obj, populateProps) {
    if (typeof obj !== 'object') {
      throw new BadRequestError('bad entity to save in db');
    }

    const newRecord = new this.Model(await this.populatePropertiesInObject(obj, populateProps));
    const result = await CrudMongodb.safeWrite(newRecord.save());

    return this.convertIdsToString(result.toObject());
  }

  async update(id, obj, populateProps) {
    const result = await CrudMongodb.safeWrite(
      this.Model.findByIdAndUpdate(
        id,
        await this.populatePropertiesInObject(obj, populateProps)
      ).lean().exec(),
    );

    return this.convertIdsToString(result.toObject());
  }

  async deleteById(id, populateProps) {
    return this.Model.findByIdAndDelete(id).exec();
  }

  static async safeWrite(action) {
    try {
      return await action;
    } catch (err) {
      CrudMongodb.handleMongodbErrors(err);
    }
  }

  static handleMongodbErrors(result) {
    if (result && result.driver && result.code === 11000) {
      throw new BadRequestError(
        `${Object.keys(result.keyValue)
          .join(', ')
          .toUpperCase()} must be unique`
      );
    }
    if (result.errors) {
      throw new DatabaseError(
        result._message,
      );
    }
    throw new DatabaseError();
  }
}

module.exports = CrudMongodb;
