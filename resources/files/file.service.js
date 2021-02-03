const CrudService = require('../prototype/crud.service');

class FileService extends CrudService {
  async getByMessageId(message) {
    let files = await this.repo.getByMessageId(message);
    if (!files) return [];
    if (!files.length) return [];
    files = files.map((record) => ({
      _id: record._id,
      filename: record.filename,
      message: record.message,
      size: record.size,
    }));
    return files;
  }
}

module.exports = FileService;
