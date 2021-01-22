const BadRequestError = require('../../errors/bad-request.error');

const encryptPasswordHandler = async (req, res, next) => {
  if (req.body.password) {
    req.body.password = await this.cryptService.toHash(req.body.password);
  }
  if (!req.body.password) {
    throw new BadRequestError();
  }
  next();
};

module.exports = encryptPasswordHandler;
