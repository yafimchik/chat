const BadRequestError = require('../errors/bad-request.error');

function generateValidator(schema) {
  return async (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      throw new BadRequestError(error.details[0].message);
    }
    next();
  };
}

function toArrayBuffer(buffer, size) {
  return buffer.buffer.slice(0, size);
}

module.exports = {
  generateValidator,
  toArrayBuffer,
};
