class Status {
  constructor({ chat, voiceChannel } = {}) {
    if (chat) this.chat = chat;
    if (voiceChannel) this.voiceChannel = voiceChannel;
  }

  hasChanges(newStatus) {
    if (!newStatus) {
      return this.chat || this.voiceChannel;
    }
    return this.chat !== newStatus.chat || this.voiceChannel !== newStatus.voiceChannel;
  }

  update(status) {
    if (!this.hasChanges(status)) {
      return false;
    }

    if (status) {
      this.chat = status.chat;
      this.voiceChannel = status.voiceChannel;
    } else {
      this.chat = undefined;
      this.voiceChannel = undefined;
    }

    return true;
  }
}

module.exports = Status;
