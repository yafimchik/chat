const CrudMongodb = require("../prototype/crud.mongodb");
const mongoose = require("mongoose");

class AudioCrudMongodb extends CrudMongodb {
  constructor(...props) {
    super(...props);

    this.getByMessageId = async function (messageId) {
      return this
        .getWhere({ message: mongoose.Types.ObjectId(messageId) }, undefined, ['audio']);
    };
  }

}

module.exports = AudioCrudMongodb;
