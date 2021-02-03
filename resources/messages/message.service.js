const CrudService = require('../prototype/crud.service');
const DatabaseError = require('../../errors/database.error');

class MessageService extends CrudService {
  async getAll() {
    return super.getAll([]);
  }

  async getHistory(chat, offset = 0) {
    const result = await this.repo.getChatHistory(chat, offset);

    if (result === undefined) {
      throw new DatabaseError();
    }
    return result;
  }
}

module.exports = MessageService;
