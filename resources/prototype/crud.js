class Crud {
  async getAll() {}

  async getWhere(conditionObject) {}

  async getById(id) {}

  async getMany(idArray) {
    const results = await Promise.all(idArray.map(id => this.getById(id)));
    return results;
  }

  async create(object) {}

  async createMany(objectArray) {
    const results = await Promise.all(objectArray.map(object => this.create(object)));
    return results.some(result => !result);
  }

  async update(id, updateObject) {}

  async updateMany(idArray, updateObject) {
    const results = await Promise.all(idArray.map(id => this.update(id, updateObject)));
    return results.some(result => !result);
  }

  async deleteById(id) {}

  async deleteMany(idArray) {
    const results = await Promise.all(idArray.map(id => this.deleteById(id)));
    return results.some(result => !result);
  }
}

module.exports = Crud;
