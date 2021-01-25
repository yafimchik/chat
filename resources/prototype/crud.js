class Crud {
  async getAll(options) {}

  async getWhere(conditionObject, options) {}

  async getWhereByOrderLimitOffset(condition, order, limit, offset, options) {}

  async getById(id, options) {}

  async getMany(idArray, options) {
    const results = await Promise.all(idArray.map(id => this.getById(id, options)));
    return results;
  }

  async create(object, options) {}

  async createMany(objectArray, options) {
    const results = await Promise.all(objectArray.map(object => this.create(object, options)));
    return results.some(result => !result);
  }

  async update(id, updateObject, options) {}

  async updateMany(idArray, updateObject, options) {
    const results = await Promise.all(idArray.map(id => this.update(id, updateObject, options)));
    return results.some(result => !result);
  }

  async deleteById(id, options) {}

  async deleteMany(idArray, options) {
    const results = await Promise.all(idArray.map(id => this.deleteById(id, options)));
    return results.some(result => !result);
  }
}

module.exports = Crud;
