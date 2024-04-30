import React from 'react';
import style from './index.module.css';
import Dimmer from '~/client/script/class/Dimmer';

class UpdateConfirm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      display: true,
    };
    this.update = this.update.bind(this);
    this.close = this.close.bind(this);
  }

  update() {
    location.reload();
    this.dimmer.close();
  }

  close() {
    this.setState({
      display: false,
    });
    this.dimmer.hidden();
  }

  componentDidMount() {
    this.dimmer = new Dimmer();
    this.dimmer.show();
  }

  componentWillUnmount() {
    this.close();
  }

  render() {
    const { display, } = this.state;
    let confirm = null;
    if (display) {
      confirm =
      <div className={style.confirm}>
        <div className={style.title}>
          Detect a new version update of this webapp.Whether or not process update?
        </div>
        <div className={style.btngrp}>
          <button onClick={this.update} className={[style.btn, style.update].join(' ')}>
            update
          </button>
          <button onClick={this.close} className={[style.btn, style.ignore].join(' ')}>
            delay util next an minute
          </button>
        </div>
      </div>
    }
    return confirm;
  }
}

export default UpdateConfirm;
