import WebRTCConnection from '@/chat-engine-client/voice-channel/webrtc.connection';
import AudioStreamMixer from '@/chat-engine-client/voice-channel/audio-stream-mixer';
import Media from '@/chat-engine-client/voice-channel/media';

export default class P2PClient {
  constructor(voiceChannel, webRTCConfig) {
    this.webRTCConfig = webRTCConfig;
    this.voiceChannel = voiceChannel;
    this.speakerConnections = [];
    this.p2pOutputConnections = [];
    this.p2pInputConnections = [];

    this.microphone = new Media();

    this.currentInputStreamIndex = undefined;
  }

  get p2pConnections() {
    return [...this.p2pOutputConnections, ...this.p2pInputConnections];
  }

  async onWebRTCMessage(
    {
      user,
      ice,
      answer,
      offer,
      uniqueMessageId,
    }) {
    const contact = user;
    let targetConnection = this.getConnectionByContact(contact);
    if (ice) await targetConnection.onIce(ice);
    else if (answer) await targetConnection.onAnswer(answer);
    else if (offer) await targetConnection.onOffer(offer, uniqueMessageId);
  }

  async onCreateP2PConnectionMessage({ user, isOutputConnection }) {
    let targetConnection;
    if (isOutputConnection) {
      targetConnection = this.getP2POutputConnectionByContact(user);
    } else {
      targetConnection = this.getP2PInputConnectionByContact(user);
    }

    if (!targetConnection) {
      const connectionToClose = this.getConnectionByContact(user);
      if (connectionToClose) connectionToClose.close();

      if (isOutputConnection) {
        this.createP2POutputConnection(user);
      } else {
        this.createP2PInputConnection(user);
      }
    }
  }

  async onConnectionsInfoMessage({ inputs, outputs }) {
    const newInputs = inputs.filter((contact) => !this.getP2PInputConnectionByContact(contact));
    const newOutputs = outputs.filter((contact) => !this.getP2POutputConnectionByContact(contact));

    const inputConnectionsToClose = this.p2pInputConnections
      .filter(({ contact }) => !inputs.includes(contact));
    const outputConnectionsToClose = this.p2pOutputConnections
      .filter(({ contact }) => !outputs.includes(contact));

    newInputs.forEach(this.createP2PInputConnection.bind(this));
    newOutputs.forEach(this.createP2POutputConnection.bind(this));

    [...inputConnectionsToClose, ...outputConnectionsToClose]
      .forEach((connection) => connection.close());
  }Z

  createSpeakerConnection(contact) {
    let connection = this.speakerConnections.find((connection) => connection.contact === contact);
    if (connection) return connection;

    connection = new WebRTCConnection(contact, this);
    this.speakerConnections.push(connection);
    connection.createPeerConnection(this.microphone.stream);
  }

  createP2PInputConnection(contact) {
    let connection = this.getP2PInputConnectionByContact(contact);
    if (connection) return connection;

    connection = new WebRTCConnection(contact, this);
    this.p2pInputConnections.push(connection);

    connection.createPeerConnection();
  }

  createP2POutputConnection(contact) {
    let connection = this.getP2POutputConnectionByContact(contact);
    if (connection) return connection;

    connection = new WebRTCConnection(contact, this);
    this.p2pOutputConnections.push(connection);

    connection.createPeerConnection(this.outputStream);
  }

  isContactSpeaker(contact) {
    this.speakers.includes(contact);
  }

  getP2PInputConnectionByContact(contact) {
    return this.getConnectionByContact(contact, this.p2pInputConnections);
  }

  getP2POutputConnectionByContact(contact) {
    return this.getConnectionByContact(contact, this.p2pOutputConnections);
  }

  getP2PConnectionByContact(contact) {
    return this.getConnectionByContact(contact, this.p2pConnections);
  }

  getConnectionByContact(contact, connections = this.allConnections) {
    return connections.find((connection) => connection.contact === contact);
  }

  get user() {
    return this.voiceChannel.user;
  }

  get allConnections() {
    return [...this.speakerConnections, ...this.p2pConnections];
  }

  get speakers() {
    return this.voiceChannel.speakers;
  }

  async connectLikeSpeaker() {
    this.isSpeaker = true;
    await this.connectToSpeakers();
  }

  async connectToSpeakers() {
    await this.microphone.setInputFromMediaDevice();

    this.speakerConnections = this.speakers
      .filter((contact) => contact !== this.user)
      .map(this.createSpeakerConnection.bind(this));
    await Promise.all(this.speakerConnections.map((connection) => connection.connectToClient()));

    const inputStreams = this.speakerConnections.map((connection) => connection.inputStream);
    this.speakerStreamsMixer = new AudioStreamMixer([this.microphone.stream, ...inputStreams]);
  }

  onMainP2PInputDisconnect() {
    this.selectMainP2PInputConnection();
    this.p2pOutputConnections.forEach((connection) => {
      connection.updateOutputStream(this.inputStream);
    });
  }

  selectMainP2PInputConnection() {
    if (this.mainP2PInputConnection) this.mainP2PInputConnection.onDisconnected = undefined;
    this.mainP2PInputConnection = this.p2pInputConnections
      .find((connection) => connection.isActive);
    if (this.mainP2PInputConnection) {
      this.mainP2PInputConnection.onDisconnected = this.onMainP2PInputDisconnect.bind(this);
    }
  }

  get inputStream() {
    if (!this.mainP2PInputConnection || !this.mainP2PInputConnection.isActive) {
      this.selectMainP2PInputConnection();
    }
    if (!this.mainP2PInputConnection) return undefined;
    return this.mainP2PInputConnection.inputStream;
  }

  get outputStream() {
    if (this.speakerStreamsMixer) return this.speakerStreamsMixer.resultStream;
    return this.inputStream;
  }
}
