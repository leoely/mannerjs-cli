import React from 'react';
import global from '~/client/script/obj/global';

const {
  emitter,
  location,
  clientFetch,
} = global;

class WebApp extends React.Component {
  constructor(props) {
    super(props);
    this.checkUpdate = this.checkUpdate.bind(this);
    this.time = new Date().getTime();
  }

  async checkUpdate() {
    const response = await clientFetch.fetch('/get/system/main', {
      method: 'POST',
    });
    if (response.ok) {
      const result = await response.json();
      const { time, } = this;
      emitter.send('update', mtimeMs > time);
    }
  }

  async componentDidMount() {
    this.id = setInterval(this.checkUpdate, 1000 * 60 * 20);
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
