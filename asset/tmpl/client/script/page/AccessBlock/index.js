import React from 'react';
import {
  FontAwesomeIcon,
} from '@fortawesome/react-fontawesome';
import {
  faEyeSlash,
} from '@fortawesome/free-solid-svg-icons';
import Page from '~/client/script/component/Page';
import formatNumber from '~/client/script/lib/util/formatNumber';
import formatLocation from '~/client/script/lib/util/formatLocation';
import global from '~/client/script/obj/global';
import style from './index.module.css';

const {
  emitter,
} = global;

class AccessBlock extends Page {
  constructor(props) {
    super(props);
    this.state = {
      ip: '',
      time: 0,
    };
    this.decreaseClock = this.decreaseClock.bind(this);
  }

  decreaseClock() {
    let { time, } = this.state;
    if (time > 0) {
      time -= 500;
      localStorage.setItem('time', String(time));
      this.setState({ time, });
    } else {
      const { id, } = this;
      localStorage.removeItem('time');
      localStorage.removeItem('ip');
      clearInterval(id);
      emitter.send('block:false');
    }
  }

  componentDidMount() {
    const timeString = localStorage.getItem('time');
    const ip = localStorage.getItem('ip');
    if (timeString !== null && ip !== null) {
      const time = parseInt(timeString);
      this.setState({
        ip,
        time,
      });
    }
    this.id = setInterval(this.decreaseClock, 500);
  }

  render() {
    const { ip, time, } = this.state;
    return (
      <div className={style.accessBlock}>
        <FontAwesomeIcon className={style.handIcon} icon={faEyeSlash} />
        The current IP&nbsp;
        <span className={[style.emphasis, style.ip].join(' ')}>
        {formatLocation(ip)}
        </span>
        &nbsp;is blocked due to frequent acess.Then blocking will end in&nbsp;
        <span className={[style.emphasis, style.time].join(' ')}>
        {formatNumber(time)}
        </span>
        &nbsp;milliseconds.
      </div>
    );
  }
}

export default AccessBlock;
