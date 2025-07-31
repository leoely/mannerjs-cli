import React from 'react';
import Page from '~/client/script/component/Page';
import global from '~/client/script/obj/global';
import style from './index.module.css';

const {
  emitter,
  clientFetch,
} = global;

class LatencyTooHigh extends Page {
  constructor(props) {
    super(props);
  }

  stillVisit() {
    emitter.send('busy:false');
  }

  async ownComponentWillUnmount() {
    clientFetch.setHasTimeout(false);
  }

  render() {
    return (
      <div className={style.latencyTooHigh}>
        <svg className={style.logoIcon} version="1.0" xmlns="http://www.w3.org/2000/svg"
         width="300.000000pt" height="300.000000pt" viewBox="0 0 300.000000 300.000000"
         preserveAspectRatio="xMidYMid meet">
          <g transform="translate(0.000000,300.000000) scale(0.100000,-0.100000)"
          fill="#000000" stroke="none">
          <path d="M1302 2989 c-638 -86 -1152 -574 -1279 -1216 -24 -121 -24 -412 0
          -539 112 -604 580 -1081 1182 -1205 49 -10 91 -16 93 -14 8 7 22 210 28 390 6
          166 5 173 -25 300 -18 72 -45 157 -60 190 -34 73 -102 156 -171 210 -84 65
          -116 146 -130 325 -5 67 -7 127 -4 135 3 7 6 201 8 431 2 391 4 426 24 519 26
          115 51 182 71 190 8 3 25 -5 38 -17 l25 -23 -7 -300 c-6 -245 -4 -332 9 -475
          10 -96 16 -193 15 -215 -4 -66 13 -55 33 20 27 107 37 243 42 570 6 363 12
          432 38 462 17 18 24 20 49 11 17 -6 31 -19 33 -31 12 -57 15 -271 6 -342 -18
          -141 -29 -402 -23 -576 3 -93 9 -169 13 -169 12 0 71 233 81 319 5 47 13 194
          19 326 14 349 43 485 100 485 35 0 43 -49 36 -238 -4 -97 -14 -240 -21 -317
          -27 -260 -18 -615 15 -615 25 0 34 83 46 425 12 372 34 603 61 667 8 20 29 49
          45 65 l30 28 24 -28 c21 -25 24 -38 24 -107 0 -104 -17 -312 -35 -425 -38
          -234 -48 -544 -20 -581 14 -18 16 -18 29 -1 8 10 17 37 20 60 9 60 33 362 41
          497 5 99 23 294 40 449 7 58 29 91 60 91 45 0 57 -36 67 -196 9 -149 2 -249
          -36 -496 -8 -53 -15 -161 -16 -240 -3 -262 -44 -545 -124 -858 -41 -157 -55
          -204 -82 -276 -25 -66 -26 -82 -33 -334 -4 -145 -5 -275 -3 -288 4 -21 8 -22
          51 -16 160 23 385 103 524 186 137 83 204 135 313 244 208 208 350 478 410
          779 26 126 26 424 0 550 -61 305 -201 571 -415 785 -213 213 -484 356 -781
          415 -102 20 -374 28 -478 14z"/>
          </g>
        </svg>
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
