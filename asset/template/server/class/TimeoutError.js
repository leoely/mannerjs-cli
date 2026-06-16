const nameKey = Symbol('name');

class TimeoutError extends Error {
  constructor(message) {
    super(message);
    this[nameKey] = 'TimeoutError';
  }
}

export default TimeoutError;
