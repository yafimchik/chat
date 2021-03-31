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

function shuffleArray(array) {
  if (!array || !array.length) return array;
  for(let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[j];
    array[j] = array[i];
    array[i] = temp;
  }
  return array;
}

function randomInt(min, max) {
  // random number of [min, max)
  const rand = min + Math.random() * (max - min);
  return Math.floor(rand);
}

function getRandomItem(array) {
  if (!array || !array.length) return undefined;
  return array[randomInt(0, array.length)];
}

function getRandomItems(array, count) {
  if (!array || !array.length) return undefined;
  return getShuffledIndexes(array)
    .slice(0, count)
    .map((index) => array[index]);
}

function getShuffledIndexes(array) {
  if (!array || !array.length) return [];
  const result = array.map((item, index) => index);
  return shuffleArray(result);
}

function forRandomEachInArray(array, fn) {
  if (!array || !array.length) return;
  if (!fn) return;
  const shuffledIndexes = getShuffledIndexes(array);
  for(let i = 0; i< shuffledIndexes.length - 1; i += 1) {
    const index = shuffledIndexes[i];
    fn(array[index], index);
  }
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
  shuffleArray,
  getShuffledIndexes,
  forRandomEachInArray,
  randomInt,
  getRandomItem,
  getRandomItems,
};
