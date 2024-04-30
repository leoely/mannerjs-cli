import React from 'react';
import checkUpdate from '~/client/script/lib/checkUpdate';
import global from '~/client/script/obj/global';

const {
  location,
} = global;

class WebApp extends React.Component {
  constructor(props) {
    super(props);
    this.checkUpdate = this.checkUpdate.bind(this);
    this.updateTime = new Date().getTime();
  }

  dealUpdate() {
    const id = setInterval(this.checkUpdate, 1000 * 60 * 30);
  }

  dealHistory() {
    window.addEventListener('popstate', (event) => {
      location.to(event.currentTarget.location.pathname);
    });
  }

  async checkUpdate() {
    const response = await fetch('/update/time', {
      method: 'POST',
    });
    const timeText = await response.text();
    const update = parseInt(timeText) > this.updateTime;
    this.setState({
      update,
    });
  }

  async componentDidMount() {
    this.dealUpdate();
    this.dealHistory();
    await this.ownComponentDidMount();
  }

  async componentWillUnmount() {
    clearInterval(this.id);
  }
}

export default WebApp;
