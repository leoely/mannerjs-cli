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
    this.startUpTime = new Date().getTime();
  }

  async checkUpdate() {
    const response = await clientFetch.fetch('/update/message', {
      method: 'POST',
    });
    const message = await response.json();
    const { startUpTime, } = this;
    this.setState({ update: message.startUpTime > startUpTime, });
  }

  async componentDidMount() {
    this.id = setInterval(this.checkUpdate, 1000 * 60 * 30);
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
