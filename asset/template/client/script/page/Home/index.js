import React from 'react';
import Page from '~/client/script/component/Page';
import welcomeImg from './welcome.png';
import style from './index.module.css';

class Home extends Page {
  render() {
    return (
      <div className={style.home}>
        <img
          className={style.welcome}
          src={welcomeImg}
          alt="manner.js welcome image"
        />
      </div>
    );
  }
}

export default Home;
