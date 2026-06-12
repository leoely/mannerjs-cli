import React from 'react';
import global from '~/client/script/obj/global';

const {
  emitter,
  location,
  clientFetch,
} = global;

const checkUpdateKey = Symbol('checkUpdate');
const timeKey = Symbol('time');

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
      emitter.send('update', mtimeMs > time);
    }
  }

  async componentDidMount() {
    this.id = setInterval(this[checkUpdateKey], 1000 * 60 * 20);
    window.addEventListener('popstate', (event) => {
      location.to(event.currentTarget.location.pathname);
    });
    await this.ownComponentDidMount();
  }

  async componentWillUnmount() {
    clearInterval(this.id);
  }
}

export default WebApp;
