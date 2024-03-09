class Location {
  constructor() {
    this.callbacks = [];
    this.to(location.pathname);
  }

  onChange(callback) {
    this.callbacks.push(callback);
  }

  to(l) {
    this.location = l;
    history.pushState({}, "", l);
    this.callbacks.forEach((cb) => cb(l));
  }
}

export default Location;
