import {VOICE_CHANNEL_USER_ROLES} from "@/chat-engine-client/chat-engine.client.constants";

export default class VoiceChannelClient {
  constructor() {
    this.speakers = [];
    this.listeners = [];
  }

  setContactsFromStatus(serverStatus) {
    this.speakers = [];
    this.listeners = [];
    serverStatus.forEach((status) => {
      if (this.voiceChannel.id !== status.value.voiceChannel) return;
      if (value.role === VOICE_CHANNEL_USER_ROLES.speaker) {
        this.speakers.push(status.user);
      } else if (value.role === VOICE_CHANNEL_USER_ROLES.listener) {
        this.listeners.push(status.user);
      }
    });
  }
}
