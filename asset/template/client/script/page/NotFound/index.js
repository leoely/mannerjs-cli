import React from 'react';
import Page from '~/client/script/component/Page';
import Image from '~/client/script/component/Image';
import notFoundImg from './not-found.png';
import formatLocation from '~/client/script/lib/util/formatLocation';
import * as style from './index.module.css';

class NotFound extends Page {
  render() {
    return (
      <div className={style.notFound}>
        <div className={style.detail}>
          <h2 className={style.title}>404 [Not Found]</h2>
          <p className={style.passage}>
            No corresponding resource found at the current location.
            Please confirm that the current location is correct.
          </p>
          <div className={style.explain}>
            Location
            <span className={style.location}>{formatLocation(location.pathname)}</span>
            don't exist.
          </div>
        </div>
        <Image className={style.image} src={notFoundImg} />
      </div>
    );
  }
}

export default NotFound;
