const CrudService = require("../prototype/crud.service");

class ChatService extends CrudService {
  async getChatsOfVirtualServer(virtualServer) {
    return await this.getWhere({ virtualServer });
  }
}

module.exports = ChatService;
