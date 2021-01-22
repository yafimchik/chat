const ServerError = require('../../errors/server-error.error');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ServerError) {
    res.status(err.responseStatus).json({ message: err.shortMsg });
    return;
  }
  console.error(err);
  res.status(500).json({
    message: 'Internal Server Error',
  });
}

module.exports = errorHandler;
