const jwt = require('jsonwebtoken');
const { JWT_SECRET_KEY } = require('../configs/config');

class JwtService {
  constructor(jwtLib, secret) {
    this.jwt = jwtLib;
    this.secret = secret;
  }

  async generateJWT(payload) {
    const token = await this.jwt.sign(payload, this.secret);
    return token;
  }

  async verifyJWT(token) {
    const result = await this.jwt.verify(token, this.secret);
    return result;
  }

  decode(payload) {
    return this.jwt.decode(payload);
  }
}

const jwtService = new JwtService(jwt, JWT_SECRET_KEY);

module.exports = jwtService;
