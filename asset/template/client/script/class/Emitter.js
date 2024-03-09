class Emitter {
  constructor() {
    this.callbacks = {};
  }

  async send(event, data) {
    const { callbacks, } = this;
    const cbs = callbacks[event];
    if (Array.isArray(cbs)) {
      for (let i = 0; i < cbs.length; i += 1) {
        await cbs[i](data);
      }
    }
  }

  on(event, callback) {
    const { callbacks, } = this;
    if (callbacks[event] === undefined) {
      callbacks[event] = [];
    }
    callbacks[event].push(callback);
  }

  remove(event, callback) {
    const cbs = this.callbacks[event];
    if (Array.isArray(cbs)) {
      for (let i = 0; i < cbs.length; i += 1) {
        if (callback === cbs[i]) {
          cbs.splice(i, 1);
        }
      }
    }
  }
}

export default Emitter;
