import React from 'react';
import style from './index.module.css';

class Container extends React.Component {
  render() {
    return (
      <div className={style.container}>
        <div className={style.inner}>{this.props.children}</div>
      </div>
    );
  }
}

export default Container;
