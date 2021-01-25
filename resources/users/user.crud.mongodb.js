const CrudMongodb = require("../prototype/crud.mongodb");
const NotFoundError = require("../../errors/not-found.error");

class UserCrudMongodb extends CrudMongodb {
  constructor(...props) {
    super(...props);

    this.getByLogin = async function(username, populateProps) {
      const query = this.Model
        .findOne({username})
      const user = await query.lean().exec();
      return user;
    }
  }
}

module.exports = UserCrudMongodb;
