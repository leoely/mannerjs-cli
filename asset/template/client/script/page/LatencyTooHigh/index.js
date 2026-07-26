import React from 'react';
import Page from '~/client/script/component/Page';
import Image from '~/client/script/component/Image';
import latencyTooHighImg from './latency-too-high.png';
import global from '~/client/script/obj/global';
import * as style from './index.module.css';

const {
  emitter,
  clientFetch,
} = global;

const stillVisitKey = Symbol('stillVisit');

class LatencyTooHigh extends Page {
  constructor(props) {
    super(props);
  }

  [stillVisitKey]() {
    emitter.send('busy', false);
  }

  async ownComponentWillUnmount() {
    clientFetch.setHasTimeout(false);
  }

  render() {
    return (
      <div className={style.latencyTooHigh}>
        <Image
          className={style.image}
          src={latencyTooHighImg}
          alt="manner.js server latency too high image"
        />
        <div className={style.detail}>
          The current page is access delay too high due to excessive server load.
          Recommend trying to access the site during off-peak hours for a better
          user experience.<button name="stillVisit" onClick={this[stillVisitKey]} className={style.stillVisit}>Still Visit</button>
        </div>
        <h2 className={style.title}>Latency too high</h2>
      </div>
    );
  }
}

export default LatencyTooHigh;
