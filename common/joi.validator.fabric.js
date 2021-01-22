const BadRequestError = require('../errors/bad-request.error');

class JoiValidatorFabric {
  create(schema) {
    return async (req, res, next) => {
      const { error } = schema.validate(req.body);
      if (error) {
        throw new BadRequestError(error.details[0].message);
      }
      next();
    };
  }
}

module.exports = JoiValidatorFabric;
