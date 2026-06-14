import React from 'react';
import Page from '~/client/script/component/Page';
import welcomeImg from './welcome.png';
import global from '~/client/script/obj/global';
import * as style from './index.module.css';

const {
  clientFetch,
} = global;

class Home extends Page {
  constructor(props) {
    super(props);
  }

  async componentDidMount() {
    const { mode, } = this.props;
    switch (mode) {
      case 'test': {
        const response = await clientFetch.fetch('/get/system/test', {
          method: 'POST',
        });
        if (response.ok) {
          const result = await response.json();
          console.log(result.tip);
        }
        break;
      }
    }
  }

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
