const { getShuffledIndexes } = require('../../../../common/utils');

class Peer {
  constructor(userId, isOldBrowser = false, p2pNetwork) {
    this.p2pNetwork = p2pNetwork;
    this.userId = userId;
    this.isOldBrowser = isOldBrowser;
    this.inputPeers = [];
    this.outputPeers = [];
    this.compatibilityPeers = [];

    this.mainInput = undefined;
    this.connected = false;
    this.hasProblems = false;
    this.depth = 0;

    this.currentInputUser = undefined;
    this.onReconnect = false;
  }

  get inputConnectionsLimit() {
    return this.p2pNetwork.inputConnectionsCount;
  }

  get outputConnectionsLimit() {
    return this.inputConnectionsLimit * this.p2pNetwork.multiplier;
  }

  get allOutputPeers() {
    return [...this.compatibilityPeers, ...this.outputPeers];
  }

  get isNeededInInputs() {
    return this.inputPeers.length < this.inputConnectionsCount;
  }

  get isReadyForNewConnections() {
    if (this.isOldBrowser) return false;
    return this.connected && !this.hasProblems;
  }

  get usedCompatibilityConnectionsCount() {
    return this.compatibilityPeers.length;
  }

  get isFullFree() {
    if (this.isOldBrowser) return false;
    return this.outputPeers.length === 0;
  }

  get isFree() {
    if (this.isOldBrowser) return false;
    return this.outputConnectionsLimit - this.outputPeers.length > 0;
  }

  disconnectFromPeer(peer) {
    const comparePeerFn = (somePeer) => somePeer !== peer;

    this.inputPeers = this.inputPeers.filter(comparePeerFn);
    this.outputPeers = this.outputPeers.filter(comparePeerFn);
    this.compatibilityPeers = this.compatibilityPeers.filter(comparePeerFn);
  }

  disconnect() {
    this.connected = false;

    const disconnectFromThisFn = (peer) => {
      peer.disconnectFromPeer(this);
    };

    this.inputPeers.forEach(disconnectFromThisFn);
    this.outputPeers.forEach(disconnectFromThisFn);
    this.compatibilityPeers.forEach(disconnectFromThisFn);

    this.inputPeers = [];
    this.outputPeers = [];
    this.compatibilityPeers = [];
  }

  replacePeer(peer) {
    this.disconnect();
    this.inputPeers = [...peer.inputPeers];
    this.outputPeers = [...peer.outputPeers].filter((somePeer) => somePeer !== peer);
    this.compatibilityPeers = [...peer.compatibilityPeers];

    this.onReconnect = true;
  }

  addCompatibilityListener(peer) {
    this.compatibilityPeers.push(peer);
    peer.addInputPeer(this);
  }

  addInputPeer(peer) {
    if (this.inputPeers.some((somePeer) => somePeer === peer)) return false;
    this.depth = peer.depth + 1;
    this.inputPeers.push(peer);
    return true;
  }

  addListener(peer, compatibility = false) {
    if (this.outputPeers.find((somePeer) => somePeer === peer)) return false;
    if (this.compatibilityPeers.find((somePeer) => somePeer === peer)) return false;
    if (compatibility) {
      this.addCompatibilityListener(peer);
    } else {
      if (!this.isFree) return false;
      this.outputPeers.push(peer);
    }
    peer.addInputPeer(this);
    return true;
  }

  getNextFreePeer(searchDepth = 0) {
    if (!this.isReadyForNewConnections) return undefined;
    if (this.isFree) return this;
    if (searchDepth <= 0) return undefined;

    const shuffledIndexes = getShuffledIndexes(this.outputPeers);

    for (let i = 0; i < (this.outputPeers.length - 1); i += 1) {
      const index = shuffledIndexes[i];
      const peer = this.outputPeers[index].getNextFreePeer(searchDepth - 1);
      if (peer && peer.isFree) return peer;
    }
    return undefined;
  }

  getFullFreePeer() {
    if (this.isFullFree) return this;

    const shuffledIndexes = getShuffledIndexes(this.outputPeers);

    for (let i = 0; i < (this.outputPeers.length - 1); i += 1) {
      const index = shuffledIndexes[i];
      const peer = this.outputPeers[index];
      if (peer.isFullFree) return peer;
    }

    for (let i = 0; i < (this.outputPeers.length - 1); i += 1) {
      const index = shuffledIndexes[i];
      const peer = this.outputPeers[index].getFullFreePeer();
      if (peer && peer.isFullFree) return peer;
    }

    return undefined;
  }

  get connections() {
    return {
      user: this.userId,
      inputs: this.inputPeers.map((peer) => peer.userId),
      outputs: this.allOutputPeers.map((peer) => peer.userId),
    };
  }
}

module.exports = Peer;
