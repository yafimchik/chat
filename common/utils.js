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

function filterDoublesInArray(array, propertyGetterFn = (element) => element) {
  return array.filter((item, index) => {
    const firstIndex = array
      .findIndex((firstItem) => propertyGetterFn(firstItem) === propertyGetterFn(item));
    return firstIndex === index;
  });
}

module.exports = {
  generateValidator,
  toArrayBuffer,
  filterDoublesInArray,
};
