import React from 'react';
import {
  FontAwesomeIcon,
} from '@fortawesome/react-fontawesome';
import {
  faFaceTired,
  faFileArrowDown,
  faHourglassHalf,
} from '@fortawesome/free-solid-svg-icons';
import Dimmer from '~/client/script/class/Dimmer';
import global from '~/client/script/obj/global';
import * as style from './index.module.css';

const {
  location,
  emitter,
} = global;

const updateKey = Symbol('update');
const closeKey = Symbol('close');
const dimmerKey = Symbol('dimmer')
const showKey = Symbol.for('show');
const hiddenKey = Symbol.for('hidden');

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
    this[dimmerKey][hiddenKey]();
  }

  componentDidMount() {
    this[dimmerKey] = new Dimmer();
    this[dimmerKey][showKey]();
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
          <button name="update" onClick={this[updateKey]} className={[style.btn].join(' ')}>
            <FontAwesomeIcon className={[style.updateIcon, style.icon].join(' ')} icon={faHourglassHalf} />
            update
          </button>
          <button name="delay" onClick={this[closeKey]} className={[style.btn].join(' ')}>
            <FontAwesomeIcon className={[style.ignoreIcon, style.icon].join(' ')} icon={faFaceTired} />
            delay until the next thirty minutes
          </button>
        </div>
      </div>
    );
  }
}

export default UpdateConfirm;
