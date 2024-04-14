import React from 'react';
import style from './index.module.css';
import formatLocation from '~/client/script/lib/formatLocation';

class NotFound extends React.Component {
  render() {
    return(
      <div className={style.notfound}>
        <span className={style.earth}/>
        <span className={style.question}>?</span>
        Location
        <span className={style.location}>{formatLocation(location.pathname)}</span>
        don't exist.
      </div>
    );
  }
}

export default NotFound;
