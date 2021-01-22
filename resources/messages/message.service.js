const CrudService = require("../prototype/crud.service");

class MessageService extends CrudService {
  async getAll() {
    await super.getAll([]);
  }
}

module.exports = MessageService;
