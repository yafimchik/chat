const ServerError = require('../../errors/server-error.error');

// eslint-disable-next-line no-unused-vars
function errorHandler(error, req, res, next) {
  if (error instanceof ServerError) {
    res.status(error.responseStatus);
    res.status(error.responseStatus).json({ error });
  } else {
    res.status(500);
    console.error(error);
    res.json({ error: new ServerError() });
  }
}

module.exports = errorHandler;
