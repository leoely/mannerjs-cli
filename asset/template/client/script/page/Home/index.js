import React from 'react';
import Page from '~/client/script/component/Page';
import Image from '~/client/script/component/Image';
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
        <Image
          className={style.welcome}
          src={welcomeImg}
          alt="manner.js welcome image"
        />
        <div className={style.right}>
          <h1 className={style.title}>Welcome to the manner.js project.</h1>
          <ul className={style.list}>
            <li className={style.item}>
              The project is highly customizable,allowing for the modification
              of existing system compoents to confirm to user needs.
            </li>
            <li className={style.item}>
              The project is highly customizable,allowing for the modification
              of existing system compoents to confirm to user needs.
            </li>
          </ul>
        </div>
      </div>
    );
  }
}

export default Home;
