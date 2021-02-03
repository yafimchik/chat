const { AUTH_MODE } = require('../../configs/config');
const jwtService = require('../../common/jwt.service');
const UnauthorizedError = require('../../errors/unauthorized.error');

async function verifyToken(req, res, next) {
  if (!AUTH_MODE) {
    next();
    return;
  }
  const bearerHeader = req.headers.authorization;

  if (!bearerHeader) {
    throw new UnauthorizedError();
  }

  const bearer = bearerHeader.split(' ');
  const bearerToken = bearer[1];

  const result = await jwtService.verifyJWT(bearerToken);

  if (!result) {
    throw new UnauthorizedError();
  }

  req.user = result.user;

  next();
}

async function hasToken(req, res, next) {
  if (!AUTH_MODE) {
    next();
    return;
  }

  if (!req.session) {
    res.redirect('/login');
  } else if (!req.session.token) {
    req.session.destroy(() => {
      res.redirect('/login');
    });
  } else {
    req.user = await jwtService.verifyJWT(req.session.token);
    next();
  }
}

module.exports = {
  verifyToken,
  hasToken,
};
