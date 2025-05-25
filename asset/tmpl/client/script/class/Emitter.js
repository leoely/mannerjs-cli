class Emitter {
  constructor() {
    this.callbacks = {};
  }

  async send(event, data) {
    if (typeof event !== 'string') {
      throw new Error('[Error] The parameter event should be of types string.');
    }
    const { callbacks, } = this;
    const cbs = callbacks[event];
    if (Array.isArray(cbs)) {
      for (let i = 0; i < cbs.length; i += 1) {
        await cbs[i](data);
      }
    }
  }

  on(event, callback) {
    if (typeof event !== 'string') {
      throw new Error('[Error] The parameter event should be of types string.');
    }
    if (typeof callback !== 'function') {
      throw new Error('[Error] The parameter callback should be of function type.');
    }
    const { callbacks, } = this;
    if (callbacks[event] === undefined) {
      callbacks[event] = [];
    }
    callbacks[event].push(callback);
  }

  remove(event, callback) {
    if (typeof event !== 'string') {
      throw new Error('[Error] The parameter event should be of types string.');
    }
    if (typeof callback !== 'function') {
      throw new Error('[Error] The parameter callback should be of function type.');
    }
    const cbs = this.callbacks[event];
    if (Array.isArray(cbs)) {
      for (let i = 0; i < cbs.length; i += 1) {
        if (callback.toString() === cbs[i].toString()) {
          cbs.splice(i, 1);
        }
      }
    }
  }
}

export default Emitter;
