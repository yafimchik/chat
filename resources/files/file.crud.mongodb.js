const CrudMongodb = require("../prototype/crud.mongodb");

class FileCrudMongodb extends CrudMongodb {
  constructor(...props) {
    super(...props);
  }
}

module.exports = FileCrudMongodb;
