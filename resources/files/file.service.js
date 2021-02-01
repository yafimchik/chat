const CrudService = require('../prototype/crud.service');

class FileService extends CrudService {
  getByMessageId(message) {
    let files = this.getWhere({ message });
    if (!files) return [];
    files = files.map((record) => ({
      _id: record._id,
      filename: record.filename,
      size: record.file.size,
      message: record.message,
    }));
    return files;
  }
}

module.exports = FileService;
