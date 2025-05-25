class Location {
  constructor() {
    this.historys = [];
    this.callbacks = [];
    this.to = this.to.bind(this);
  }

  onChange(callback) {
    if (typeof callback !== 'function') {
      throw new Error('[Error] The parameter callback should be of funciton type.');
    }
    this.callbacks.push(callback);
  }

  back() {
    const { historys, } = this;
    const history = historys[historys.length - 1];
    if (history === window.location.pathname) {
      window.history.go(-2);
    } else {
      this.to(history);
    }
  }

  to(l) {
    if (typeof l !== 'string') {
      throw new Error('[Error] The parameter l should be of string type.');
    }
    this.historys.push(l);
    history.replaceState({}, "", l);
    history.pushState({}, "", l);
    this.callbacks.forEach((cb) => cb(l));
  }
}

export default Location;
