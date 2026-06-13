import React from 'react';
import global from '~/client/script/obj/global';

const {
  emitter,
  location,
  clientFetch,
} = global;

const checkUpdateKey = Symbol('checkUpdate');
const timeKey = Symbol('time');
const ownComponentDidMountKey = Symbol.for('ownComponentDidMount');

class WebApp extends React.Component {
  constructor(props) {
    super(props);
    this[checkUpdateKey] = this[checkUpdateKey].bind(this);
    this[timeKey] = new Date().getTime();
  }

  async [checkUpdateKey]() {
    const response = await clientFetch.fetch('/get/system/main', {
      method: 'POST',
    });
    if (response.ok) {
      const result = await response.json();
      const { [timeKey]: time, } = this;
      const { mtimeMs, } = result;
      emitter.send('update', mtimeMs > time);
    }
  }

  async componentDidMount() {
    const { mode, } = this.props;
    switch (mode) {
      case 'default':
        this.id = setInterval(this[checkUpdateKey], 1000 * 60 * 20);
        break;
      case 'test':
        this.id = setInterval(this[checkUpdateKey], 1000 * 8);
        break;
    }
    window.addEventListener('popstate', (event) => {
      location.to(event.currentTarget.location.pathname);
    });
    await this[ownComponentDidMountKey]();
  }

  async componentWillUnmount() {
    clearInterval(this.id);
  }
}

export default WebApp;
