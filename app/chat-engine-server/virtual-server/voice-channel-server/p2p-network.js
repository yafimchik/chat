const Peer = require('./peer');
const { getRandomItems } = require('../../../../common/utils');

const DEFAULT_SPEAKERS_LIMIT = 10;
const DEFAULT_INPUT_CONNECTION_COUNT = 2;
const DEFAULT_MULTIPLIER = 2;

class P2PNetwork {
  constructor(
    inputConnectionsCount = DEFAULT_INPUT_CONNECTION_COUNT,
    speakersLimit = DEFAULT_SPEAKERS_LIMIT,
    multiplier = DEFAULT_MULTIPLIER,
    voiceChannelServer,
  ) {
    this.inputConnectionsCount = inputConnectionsCount;
    this.speakersLimit = speakersLimit;
    this.multiplier = multiplier;
    this.speakers = [];
    this.listeners = [];
    this.voiceChannelServer = voiceChannelServer;
    this.treeDeepth = 0;
  }

  connectPeer(peer) {
    if (!this.speakers || !this.speakers.length) return false;
    let freePeers = [];
    let depth = 0;
    while ((!freePeers || !freePeers.length) && depth <= this.treeDeepth) {
      freePeers = this.speakers.map((speaker) => speaker.getNextFreePeer(depth));
    }

    if (freePeers && freePeers.length) {
      getRandomItems(freePeers, this.inputConnectionsCount)
        .forEach((broadcastingPeer) => {
          broadcastingPeer.addListener(peer);
        });
    }
  }

  connectPeerWithOldBrowser(peer) {
    if (!this.speakers || !this.speakers.length) return false;
    const sortedByCompatibilityConnectionsPeers = this.allPeers
      .sort((a, b) => {
        return a.usedCompatibilityConnectionsCount - b.usedCompatibilityConnectionsCount;
      });
    sortedByCompatibilityConnectionsPeers[0].addCompatibilityListener(peer);
    sortedByCompatibilityConnectionsPeers[1].addCompatibilityListener(peer);
  }

  checkTreeDepth() {
    const isDepthChanged = this.listeners
      .filter((listener) => listener.depth === this.treeDeepth).length === 0;
    if (isDepthChanged) {
      this.treeDeepth -= 1;
    }
  }

  calculateTreeDepth() {
    this.treeDeepth = this.listeners
      .reduce((newDepth, listener) => Math.max(newDepth, listener.depth), 0);
  }

  addSpeaker(userId, compatibilityMode = false) {
    if (this.isSpeaker(userId)) return true;
    if (this.speakers.length >= this.speakersLimit) return false;

    let connections = this.onUserExit(userId);
    if (!connections) {
      connections = [];
    } else if (!(connections instanceof Array)){
      connections = [connections];
    }

    const newSpeaker = new Peer(userId, compatibilityMode, this);
    this.speakers.push(newSpeaker);
    this.fixFirstLineConnections(newSpeaker);

    connections.push(newSpeaker.connections);
    return connections;
  }

  addListener(userId, compatibilityMode = false) {
    const listenerPeer = new Peer(userId, compatibilityMode, this);
    this.listeners.push(listenerPeer);

    if (compatibilityMode) {
      this.connectPeerWithOldBrowser(listenerPeer);
    } else {
      this.connectPeer(listenerPeer);
    }
    this.treeDeepth = Math.max(this.treeDeepth, listenerPeer.depth);

    return listenerPeer.connections;
  }

  fixFirstLineConnections(speaker) {
    if (!speaker || !speaker.isFree) return;

    let firstLinePeers = this.speakers.flatMap((speaker) => speaker.outputPeers);
    const peersNeededInConnections = firstLinePeers
      .filter((listener) => listener.isNeededInInputs);
    firstLinePeers = null;
    if (!peersNeededInConnections.length) return;

    let connectionsAdded = false;

    while(speaker.isFree && peersNeededInConnections.length) {
      const wasAdded = speaker.addListener(peersNeededInConnections.pop());
      connectionsAdded = connectionsAdded || wasAdded;
    }

    return connectionsAdded;
  }

  onUserExit(userId) {
    if (this.isSpeaker(userId)) {
      return this.onSpeakerExit(this.getPeerByUserId(userId));
    } else if (this.isListener(userId)){
      return this.onListenerExit(this.getPeerByUserId(userId));
    }
    return undefined;
  }

  onSpeakerExit(peer) {
    this.speakers = this.speakers.filter((speaker) => speaker !== peer);

    if (!this.speakers.length) {
      this.listeners.forEach((listener) => listener.disconnect());
      return;
    }

    const freeSpeakers = this.speakers
      .filter((speaker) => speaker.isFree);

    const speakersWithNewConnections = freeSpeakers.map((speaker) => {
      return this.fixFirstLineConnections(speaker) ? speaker : undefined;
    });

    return speakersWithNewConnections
      .filter((speaker) => !!speaker)
      .map((speaker) => speaker.connections);
  }

  onListenerExit(peer) {
    let connectionInfo;
    if (!peer.isFree) {
      const freePeer = this.getFullFreePeer();
      freePeer.replacePeer(peer);
      peer.disconnect();
      connectionInfo = freePeer.connections;
    } else {
      peer.disconnect();
    }

    this.listeners = this.listeners.filter((listener) => listener !== peer);
    if (peer.depth === this.treeDeepth) {
      this.checkTreeDepth();
    }

    return connectionInfo;
  }

  onUserConnected(userId) {
    this.getPeerByUserId(userId).connected = true;
  }

  getPeerByUserId(userId) {
    return this.allPeers.find((peer) => peer.userId === userId);
  }

  isSpeaker(userId) {
    return this.speakers.some((peer) => peer.userId === userId);
  }

  isListener(userId) {
    return this.listeners.some((peer) => peer.userId === userId);
  }

  get allPeers() {
    return [...this.speakers, ...this.listeners];
  }
}

module.exports = P2PNetwork;
