import React from 'react';
import {
  FontAwesomeIcon,
} from '@fortawesome/react-fontawesome';
import {
  faEarthAmericas,
} from '@fortawesome/free-solid-svg-icons';
import Page from '~/client/script/component/Page';
import formatLocation from '~/client/script/lib/util/formatLocation';
import * as style from './index.module.css';

class NotFound extends Page {
  render() {
    return (
      <div className={style.notfound}>
        <FontAwesomeIcon className={style.earthIcon} icon={faEarthAmericas} />
        <span className={style.question}>?</span>
        Location
        <span className={style.location}>{formatLocation(location.pathname)}</span>
        don't exist.
      </div>
    );
  }
}

export default NotFound;
