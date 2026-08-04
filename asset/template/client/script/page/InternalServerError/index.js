import React from 'react';
import Page from '~/client/script/component/Page';
import Image from '~/client/script/component/Image';
import serverErrorImg from './serverError.png';
import global from '~/client/script/obj/global';
import * as style from './index.module.css';

const {
  emitter,
  location,
} = global;

const comebackKey = Symbol('comeback');

class InternalServerError extends Page {
  constructor(props) {
    super(props);
  }

  [comebackKey]() {
    location.back();
    emitter.send('error', false);
  }

  render() {
    return (
      <div className={style.internalServerError}>
        <Image
          className={style.image}
          src={serverErrorImg}
          alt="manner.js server error image"
        />
        <h2 className={style.title}>500 [Server Error]</h2>
        <div className={style.detail}>
          There is an internal server error processing the current page.You can
          report this situation to the website maintenance personnel through
          this method.After the maintenance staff resolves this issue,the
          current will no longer display this error message.Thank you very much
          for your help in solving this problem.You can usually also acesss
          previous pages.
          <button name="comeback" onClick={this[comebackKey]} className={style.comeback}>
            Come Back
          </button>
        </div>
      </div>
    );
  }
}

export default InternalServerError;
