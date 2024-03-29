const CrudMongodb = require("../prototype/crud.mongodb");
const mongoose = require("mongoose");

class FileCrudMongodb extends CrudMongodb {
  constructor(...props) {
    super(...props);

    this.getByMessageId = async function (messageId) {
      return this
        .getWhere({ message: mongoose.Types.ObjectId(messageId) }, undefined, ['file']);
    };
  }
}

module.exports = FileCrudMongodb;
