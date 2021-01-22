const NotFoundError = require('../../errors/not-found.error');
const CrudService = require("../prototype/crud.service");

class UserService extends CrudService {
  async getByLogin(login) {
    const user = await this.repo.getByLogin(login);
    if (!user) return null;
    if (user.password) delete user.password;
    // if (!user) {
    //   throw new NotFoundError('no any user with such login');
    // }
    return user;
  }
}

module.exports = UserService;
