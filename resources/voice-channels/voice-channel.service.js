const CrudService = require('../prototype/crud.service');

class VoiceChannelService extends CrudService {
  async getVoiceChannelsOfVirtualServer(virtualServer) {
    return await this.getWhere({ virtualServer });
  }
}

module.exports = VoiceChannelService;
