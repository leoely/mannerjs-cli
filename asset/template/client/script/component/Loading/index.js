import React from 'react';
import style from './index.module.css';
import formateUnit from '~/client/script/lib/formateUnit';

class Loading extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      angle: 0,
    };
    this.spin = this.spin.bind(this);
  }

  componentDidMount() {
    this.id = setInterval(this.spin, 1000 / 29);
  }

  componentWillUnmount() {
    clearInterval(this.id);
  }

  spin() {
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
      <span
        className={[this.props.className, style.loading].join(' ')}
        style={{ transform: 'rotate(' + formateUnit(angle, 'deg') + ')', }}
      />
    );
  }
}

export default Loading;
