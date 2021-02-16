const CrudService = require('../prototype/crud.service');

class FileService extends CrudService {
  async getByMessageId(message) {
    let files = await this.repo.getByMessageId(message);
    if (!files) return [];
    if (!files.length) return [];
    return files;
  }
}

module.exports = FileService;
