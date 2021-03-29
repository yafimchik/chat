export function randomInt(min, max) {
  // random number of [min, max)
  const rand = min + Math.random() * (max - min);
  return Math.floor(rand);
}

export function getRandomItem(array) {
  if (!array || !array.length) return undefined;
  return array[randomInt(0, array.length)];
}
