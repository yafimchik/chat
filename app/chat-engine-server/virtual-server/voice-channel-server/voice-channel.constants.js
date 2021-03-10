const VOICE_CHANNEL_SUB_ACTIONS = {
  addToChannel: 'add-to-voice-channel',
  disconnectFromChannel: 'disconnect-from-voice-channel',
  addToSpeakersRequest: 'add-to-speakers-request',
  removeFromSpeakers: 'remove-from-speakers',
  addToSpeakersAnswer: 'add-to-speakers-request',
  connected: 'user-connected',
  connectToClients: 'connect-to-clients',
  newConnections: 'new-connections',
};

const WEBRTC_SUB_ACTIONS = {
  voiceChannelIce: 'voice-channel-ice',
  voiceChannelOffer: 'voice-channel-offer',
  voiceChannelAnswer: 'voice-channel-answer',
};

const VOICE_CHANNEL_BROADCAST_ANSWERS = [];

const WEBRTC_BROADCAST_ANSWERS = [
  WEBRTC_SUB_ACTIONS.voiceChannelIce,
  WEBRTC_SUB_ACTIONS.voiceChannelOffer,
  WEBRTC_SUB_ACTIONS.voiceChannelAnswer,
];

const VOICE_CHANNEL_USER_ROLES = {
  listener: 'listener',
  speaker: 'speaker',
  candidate: 'candidate',
  moderator: 'moderator',
};

module.exports = {
  VOICE_CHANNEL_SUB_ACTIONS,
  WEBRTC_SUB_ACTIONS,
  VOICE_CHANNEL_BROADCAST_ANSWERS,
  WEBRTC_BROADCAST_ANSWERS,
  VOICE_CHANNEL_USER_ROLES,
};
