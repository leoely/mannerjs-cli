import React from 'react';
import latencyTooHighImg from './latencyTooHigh.png';
import Page from '~/client/script/component/Page';
import Image from '~/client/script/component/Image';
import global from '~/client/script/obj/global';
import style from './index.module.css';

const {
  clientFetch,
  emitter,
} = global;

class LatencyTooHigh extends Page {
  stillVisit() {
    emitter.send('busy:false');
  }

  async ownComponentWillUnmount() {
    clientFetch.setHasTimeout(false);
  }

  render() {
    return (
      <div className={style.latencyTooHigh}>
        <Image className={style.logoIcon} src={latencyTooHighImg} />
        <span className={style.status}></span>
        <div className={style.hint}>
          <span className={style.reason}>
            Due to the high access delay caused by the high load of server,
          </span>
          <span className={style.suggestion}>
            it is recommended to visit the website during off-peak hours to
            improve the user experience.
          </span>
        </div>
        <button onClick={this.stillVisit} className={style.stillVisit}>Still Visit</button>
      </div>
    );
  }
}

export default LatencyTooHigh;
