const twilio = require('twilio');
const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = require('../configs/config');

const MILLIS = 1000;

class TurnService {
  constructor(sid, token) {
    this.serverConnection = twilio(sid, token);
    this.lastClientToken = undefined;
  }

  async getIceServers() {
    if (this.lastClientToken) {
      const currentDate = new Date().getTime();
      const expirationDate = new Date(this.lastClientToken.date_updated).getTime()
        + this.lastClientToken.ttl * MILLIS;
      if (currentDate < expirationDate)
        return this.lastClientToken.ice_servers;
    }
    this.lastClientToken = await this.serverConnection.tokens.create();
    return this.lastClientToken.iceServers;
  }
}

const turnService = new TurnService(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

module.exports = turnService;
