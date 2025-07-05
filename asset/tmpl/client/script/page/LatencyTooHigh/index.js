import React from 'react';
import {
  FontAwesomeIcon,
} from '@fortawesome/react-fontawesome';
import {
  faEyeSlash,
} from '@fortawesome/free-solid-svg-icons';
import style from './index.module.css';

class LatencyTooHigh extends React.Component {
  render() {
    return (
      <div>
        <FontAwesomeIcon className={style.handIcon} icon={faEyeSlash} />
      </div>
    );
  }
}

export default LatencyTooHigh;
