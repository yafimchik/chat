const BadRequestError = require('../../errors/bad-request.error');
const NotFoundError = require('../../errors/not-found.error');
const Crud = require('./crud');

class CrudService extends Crud {
  constructor(repository) {
    super();
    this.repo = repository;
  }

  async getAll(populateProps) {
    const result = await this.repo.getAll(populateProps);
    // if (!result) {
    //   throw new BadRequestError('get all query error');
    // }
    return result;
  }

  async getWhere(conditionObject, populateProps) {
    const result = await this.repo.getWhere(conditionObject, populateProps);
    // if (!result) {
    //   throw new BadRequestError('get all query error');
    // }
    return result;
  }

  async getById(id, populateProps) {
    const result = await this.repo.getById(id, populateProps);
    // if (!result) {
    //   throw new NotFoundError();
    // }
    return result;
  }

  async create(obj, populateProps) {
    const result = await this.repo.create(obj, populateProps);
    // if (!result) {
    //   throw new BadRequestError('create entity error');
    // }
    return result;
  }

  async createMany(objArray, populateProps) {
    const result = await this.repo.createMany(objArray, populateProps);
    // if (!result) {
    //   throw new BadRequestError('create entity error');
    // }
    return result;
  }

  async update(id, obj, populateProps) {
    const result = await this.repo.update(id, obj, populateProps);
    // if (!result) {
    //   throw new BadRequestError('update entity error');
    // }
    return result;
  }

  async updateMany(idArray, obj) {
    const result = await this.repo.updateMany(idArray, obj);
    // if (!result) {
    //   throw new BadRequestError('update entity error');
    // }
    return result;
  }

  async deleteById(id) {
    const result = await this.repo.deleteById(id);
    // if (!result) {
    //   throw new NotFoundError();
    // }
    return result;
  }

  async deleteMany(idArray) {
    const result = await this.repo.deleteMany(idArray);
    // if (!result) {
    //   throw new NotFoundError();
    // }
    return result;
  }
}

module.exports = CrudService;
