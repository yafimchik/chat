const cryptService = require('./crypt.service');
const jwtService = require('./jwt.service');
const serviceFabric = require("../resources/service.fabric");
const BadLoginError = require("../errors/bad-login.error");

class LoginService {
  constructor(usersServ, jwtServ, cryptServ) {
    this.jwtService = jwtServ;
    this.userService = usersServ;
    this.cryptService = cryptServ;
  }

  async login(login, password) {
    if (!login || !password) {
      throw new BadLoginError();
    }

    const user = await this.userService.getByLogin(login);
    if (!user) throw new BadLoginError();
    // let result = await this.cryptService.compareStringWithHash(
    //   password,
    //   user.password,
    // );
    let result = true; // TODO checking password

    if (!result) throw new BadLoginError();

    const jwt = await this.jwtService.generateJWT({ user });
    return jwt;
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
