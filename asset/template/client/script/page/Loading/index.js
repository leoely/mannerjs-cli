import React from 'react';
import {
  FontAwesomeIcon,
} from '@fortawesome/react-fontawesome';
import {
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import formatUnit from '~/client/script/lib/util/formatUnit';
import * as style from './index.module.css';

const spinKey = Symbol('spin');

class Loading extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      angle: 0,
    };
    this[spinKey] = this[spinKey].bind(this);
  }

  componentDidMount() {
    this.id = setInterval(this[spinKey], 1000 / 29);
  }

  componentWillUnmount() {
    clearInterval(this.id);
  }

  [spinKey]() {
    const { angle, } = this.state;
    if (angle < 360) {
      this.setState({
        angle: angle + 10,
      });
    } else {
      this.setState({
        angle: 0,
      });
    }
  }

  render() {
    const { angle, } = this.state;
    return(
      <div className={style.loading}>
        <span
          className={style.loadingIcon}
          style={{ transform: 'rotate(' + formatUnit(angle, 'deg') + ')', }}
        >
          <FontAwesomeIcon icon={faSpinner} />
        </span>
      </div>
    );
  }
}

export default Loading;
