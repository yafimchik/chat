const BadRequestError = require('../../errors/bad-request.error');
const NotFoundError = require('../../errors/not-found.error');
const Crud = require('./crud');

class CrudService extends Crud {
  constructor(repository) {
    super();
    this.repo = repository;
  }

  async getAll(options) {
    return this.repo.getAll(options);
  }

  async getWhere(conditionObject, options) {
    return this.repo.getWhere(conditionObject, options);
  }

  async getWhereByOrderLimitOffset(conditionObject, orderObject, limit, offset, options) {
    return this.repo
      .getWhereByOrderLimitOffset(
        conditionObject,
        orderObject,
        limit,
        offset,
        options,
      );
  }

  async getById(id, options) {
    const result = this.repo.getById(id, options);
    if (!result) {
      throw new NotFoundError();
    }
    return result;
  }

  async create(obj, options) {
    const result = await this.repo.create(obj, options);
    if (!result) {
      throw new BadRequestError('create entity error');
    }
    return result;
  }

  async update(id, obj, options) {
    const result = await this.repo.update(id, obj, options);
    if (!result) {
      throw new BadRequestError('update entity error');
    }
    return result;
  }

  async deleteById(id, options) {
    const result = await this.repo.deleteById(id, options);
    if (!result) {
      throw new NotFoundError();
    }
    return result;
  }
}

module.exports = CrudService;
