export default function formatUnit(val, unit) {
  if (val === undefined || val === null || isNaN(val) === true) {
    throw new Error('[Error] The parameter val should make sense.');
  }
  if (typeof unit !== 'string') {
    throw new Error('[Error] The parameter unit should be of string type.');
  }
  return val + unit;
}
