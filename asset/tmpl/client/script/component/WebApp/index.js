import React from 'react';
import global from '~/client/script/obj/global';

const {
  location,
  clientFetch,
} = global;

class WebApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      update: false,
    };
    this.checkUpdate = this.checkUpdate.bind(this);
    this.time = new Date().getTime();
  }

  async checkUpdate() {
    const response = await clientFetch.fetch('/update/message', {
      method: 'POST',
    });
    if (response !== undefined && response.ok) {
      const message = await response.json();
      const { time, } = this;
      this.setState({ update: message.updateTime > time, });
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
