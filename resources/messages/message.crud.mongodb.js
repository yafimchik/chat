const CrudMongodb = require("../prototype/crud.mongodb");
const mongoose = require("mongoose");
const CHAT_ENGINE_CONSTANTS = require("../../app/chat-engine-server/chat-engine.constants");

class MessageCrudMongodb extends CrudMongodb {
  constructor(...props) {
    super(...props);

    this.getChatHistory = async function(chat, offset) {
      return this.getWhereByOrderLimitOffset(
        { chat: mongoose.Types.ObjectId(chat) },
        { date: 'desc' },
        CHAT_ENGINE_CONSTANTS.HISTORY_LIMIT,
        offset,
        [],
      );
    };
  }

}

module.exports = MessageCrudMongodb;
