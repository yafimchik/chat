const bcrypt = require('bcrypt');
const { SALT_ROUNDS } = require('../configs/config');

class CryptService {
  constructor(cryptLib, saltRounds) {
    this.crypto = cryptLib;
    this.saltRounds = saltRounds;
  }

  async toHash(str = '') {
    const hash = await this.crypto.hash(str, SALT_ROUNDS);
    return hash;
  }

  async compareStringWithHash(str, hash) {
    const result = await this.crypto.compare(str, hash);
    return result;
  }
}

const cryptService = new CryptService(bcrypt, SALT_ROUNDS);

module.exports = cryptService;
