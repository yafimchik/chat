const CrudMongodb = require("../prototype/crud.mongodb");

class UserCrudMongodb extends CrudMongodb {
  constructor(...props) {
    super(...props);

    this.getByLogin = async function(username, populateProps) {
      const query = this.Model
        .findOne({username})
      const user = await query.exec();
      return user;
    }
  }
}

module.exports = UserCrudMongodb;
