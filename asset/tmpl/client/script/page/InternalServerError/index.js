import React from 'react';
import {
  FontAwesomeIcon,
} from '@fortawesome/react-fontawesome';
import {
  faFaceMehBlank,
} from '@fortawesome/free-solid-svg-icons';
import Page from '~/client/script/component/Page';
import global from '~/client/script/obj/global';
import style from './index.module.css';

const {
  emitter,
  location,
} = global;

class InternalServerError extends Page {
  constructor(props) {
    super(props);
  }

  comeback() {
    emitter.send('error:false');
    location.back();
  }

  render() {
    return (
      <div className={style.internalServerError}>
        <FontAwesomeIcon className={style.faceIcon} icon={faFaceMehBlank} />
        There is an error in the server of the current page.You can inform the
        the relevant personnel of the website about this situations.Thank you
        very much.In addition,you can visit other pages.
        <button onClick={this.comeback} className={style.comeback}>
          Come Back
        </button>
      </div>
    );
  }
}

export default InternalServerError;
