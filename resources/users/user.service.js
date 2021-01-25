const NotFoundError = require('../../errors/not-found.error');
const CrudService = require("../prototype/crud.service");

class UserService extends CrudService {
  async getByLogin(login) {
    const user = await this.repo.getByLogin(login);
    if (!user) throw new NotFoundError('no user with such login!');

    return user;
  }

  async getContacts() {
    const users = await this.getAll([]);
    const contacts = UserService.deletePasswords(users);
    return contacts;
  }

  async getContactsInfo(contactsOnlineIdArray) {
    const users = await this.getMany(contactsOnlineIdArray, []);
    const contacts = UserService.deletePasswords(users);
    return contacts;
  }

  async hasVirtualServer(userId, virtualServerId) {
    const user = await this.getById(userId);
    if (!user) throw new NotFoundError('USER');

    return user.virtualServers.includes(virtualServerId);
  }

  static deletePasswords(users) {
    if (!users) return users;
    return users.map((user) => {
      const contact = { ...user };
      delete contact.password;
      return contact;
    });
  }
}

module.exports = UserService;
