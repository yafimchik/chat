const DatabaseError = require('../../../../errors/database.error');
const serviceFabric = require('../../../../resources/service.fabric');
const BadRequestError = require('../../../../errors/bad-request.error');

class FullMessage {
  constructor(messageHeader) {
    this.audio = undefined;
    this.files = undefined;
    this.text = messageHeader.text;
    this.chat = messageHeader.chat;
    this.user = messageHeader.user;
    this.isWaitingAudio = false;
    this.isWaitingFile = false;
    this.savedRecord = undefined;
  }

  get attached() {
    return !!(this.audio || this.files);
  }

  setAudioInfo(info) {
    if (this.isWaitingAudio || this.isWaitingFile) throw new BadRequestError();
    this.audio = info;
    this.isWaitingAudio = true;
  }

  setAudioBinary(data) {
    if (!this.isWaitingAudio) throw new BadRequestError();
    this.audio.audio = data;
    this.isWaitingAudio = false;
  }

  setFileInfo(info) {
    if (this.isWaitingAudio || this.isWaitingFile) throw new BadRequestError();
    if (!this.files) this.files = [];
    this.files.push(info);
    this.isWaitingFile = true;
  }

  setBinary(data) {
    if (this.isWaitingFile && this.isWaitingAudio) throw new BadRequestError();
    if (this.isWaitingFile) {
      this.setFileBinary(data);
      return;
    }
    if (this.isWaitingAudio) {
      this.setAudioBinary(data);
      return;
    }
    throw new BadRequestError();
  }

  setFileBinary(data) {
    if (!this.isWaitingFile) throw new BadRequestError();
    this.files[this.files.length - 1].file = data;
    this.isWaitingFile = false;
  }

  async save() {
    this.date = new Date();

    let messageSavedInDB = await serviceFabric.create('message').create({
      text: this.text,
      user: this.user,
      date: this.date,
      chat: this.chat,
      attached: this.attached,
    });

    if (!messageSavedInDB) throw new DatabaseError();

    this.savedRecord = { ...messageSavedInDB };

    messageSavedInDB = null;

    await this.saveAudio();
    await this.saveFiles();

    return this.savedRecord;
  }

  async saveAudio() {
    if (!this.audio) return;

    this.audio.message = this.savedRecord._id;
    const audioSavedInDB = await serviceFabric.create('audio').create(this.audio);

    if (!audioSavedInDB) throw new DatabaseError();

    this.savedRecord.audio = audioSavedInDB;
    delete this.savedRecord.audio.audio;
  }

  async saveFiles() {
    if (!this.files) return;
    if (!this.files.length) return;

    this.files.forEach((record) => record.message = this.savedRecord._id);

    let filesSavedInDB = await serviceFabric.create('file').createMany(this.files);
    if (!filesSavedInDB) throw new DatabaseError();

    this.savedRecord.files = filesSavedInDB.map((fileRecord) => ({
      _id: fileRecord._id,
      message: fileRecord.message,
      size: fileRecord.size,
      filename: fileRecord.filename,
    }));
  }
}

module.exports = FullMessage;
