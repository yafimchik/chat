const Joi = require('../../common/joi.validation');
const ValidatorFabric = require("../../common/joi.validator.fabric");

const chatsValidSchema = Joi.object({
  id: Joi.string().min(1),
  username: Joi.string().min(3).max(80).required(),
  email: Joi.string().email({ tlds: { allow: false } }),
  password: Joi.string().min(5).max(255).required(),
});

const userValidator = ValidatorFabric.create(userValidSchema);

module.exports = userValidator;
