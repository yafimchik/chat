const CrudService = require("../prototype/crud.service");

class AudioService extends CrudService {
  getByMessageId(message) {
    const audios = this.getWhere({ message });
    if (!audios) return undefined;
    const audio = audios[0];
    audio.size = audio.audio.size;
    delete audio.audio;
    return audio;
  }
}

module.exports = AudioService;
