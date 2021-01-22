const PrototypeMongodbRepository = require("../prototype/crud.mongodb");

class VirtualServerCrudMongodb extends PrototypeMongodbRepository {
  async getByChatId(chatId) {
    const chat = await this.Model
      .findOne({ chatId })
      .select(this.props)
      .exec();
    return chat;
  }
}

module.exports = VirtualServerCrudMongodb;
