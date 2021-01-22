const cryptService = require('./crypt.service');
const jwtService = require('./jwt.service');
const serviceFabric = require("../resources/service.fabric");

class LoginService {
  constructor(usersServ, jwtServ, cryptServ) {
    this.jwtService = jwtServ;
    this.userService = usersServ;
    console.log(this.userService);
    this.cryptService = cryptServ;
  }

  async login(login, pswd) {
    // if (!login || !pswd) {
    //   return null;
    // }

    const user = await this.userService.getByLogin(login);
    if (!user) return null;

    let result = await this.cryptService.compareStringWithHash(
      pswd,
      'password' //
      // user.password,
    );
    result = true; // TODO checking PSWD

    if (result) {
      const jwt = await this.jwtService.generateJWT({ user });
      return jwt;
    }
    return null;
  }

  async checkToken(token) {
    return await this.jwtService.verifyJWT(token);
  }

  getUserId(token) {
    return this.jwtService.decode(token).user._id;
  }

  getUser(token) {
    return this.jwtService.decode(token).user;
  }
}

const loginService = new LoginService(serviceFabric.create('user'), jwtService, cryptService);

module.exports = loginService;
