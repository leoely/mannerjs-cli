import React from 'react';
import {
  FontAwesomeIcon,
} from '@fortawesome/react-fontawesome';
import {
  faFaceTired,
  faFileArrowDown,
  faHourglassHalf,
} from '@fortawesome/free-solid-svg-icons';
import style from './index.module.css';
import Dimmer from '~/client/script/class/Dimmer';
import global from '~/client/script/obj/global';

const {
  location,
  emitter,
} = global;

const updateKey = Symbol('update');
const closeKey = Symbol('close');
const dimmerKey = Symbol('dimmer')

class UpdateConfirm extends React.Component {
  constructor(props) {
    super(props);
    this[closeKey] = this[closeKey].bind(this);
    this[updateKey] = this[updateKey].bind(this);
  }

  [updateKey](){
    location.reload();
    this.dimmer.close();
  }

  [closeKey](){
    emitter.send('update', false);
    this[dimmerKey].hidden();
  }

  componentDidMount() {
    this[dimmerKey] = new Dimmer();
    this[dimmer].show();
  }

  componentWillUnmount() {
    this[closeKey]();
  }

  render() {
    return (
      <div className={style.confirm}>
        <div className={style.title}>
          <FontAwesomeIcon className={style.titleIcon} icon={faFileArrowDown} />
          Detect a new version update of this webapp.Whether or not process update?
        </div>
        <div className={style.btnGrp}>
          <button onClick={this[updateKey]} className={[style.btn, style.update].join(' ')}>
            <FontAwesomeIcon className={[style.updateIcon, style.icon].join(' ')} icon={faHourglassHalf} />
            update
          </button>
          <button onClick={this[closeKey]} className={[style.btn, style.ignore].join(' ')}>
            <FontAwesomeIcon className={[style.ignoreIcon, style.icon].join(' ')} icon={faFaceTired} />
            delay util the next thirty minutes
          </button>
        </div>
      </div>
    );
  }
}

export default UpdateConfirm;
