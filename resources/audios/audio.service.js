const CrudService = require("../prototype/crud.service");

class AudioService extends CrudService {
  async getByMessageId(message) {
    const audios = await this.repo.getByMessageId(message);
    if (!audios) return undefined;
    if (!audios.length) return undefined;
    const audio = audios[0];
    delete audio.audio;
    return audio;
  }
}

module.exports = AudioService;
