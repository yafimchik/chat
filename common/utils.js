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

module.exports = {
  generateValidator,
};
