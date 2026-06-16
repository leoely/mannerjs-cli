import React, { createRef, } from 'react';
import * as style from './index.module.css';

function Loading(props) {
  const { loading, className, count, } = props;
  if (loading === true) {
    return (
      <div className={[style.loading, className].join(' ')}>
        <span style={{ display: count >= 1 ? 'inline' : 'none', }} className={style.cube}></span>
        <span style={{ display: count >= 2 ? 'inline' : 'none', }} className={style.cube}></span>
        <span style={{ display: count >= 3 ? 'inline' : 'none', }} className={style.cube}></span>
        <span style={{ display: count >= 4 ? 'inline' : 'none', }} className={style.cube}></span>
        <span style={{ display: count >= 5 ? 'inline' : 'none', }} className={style.cube}></span>
        <span style={{ display: count >= 6 ? 'inline' : 'none', }} className={style.cube}></span>
      </div>
    );
  } else {
    return null;
  }
}

class Image extends React.Component {
  constructor(props) {
    super(props);
    this.imageRef = createRef();
    this.state = {
      loading: true,
      count: 0,
    };
  }

  componentDidMount() {
    const {
      imageRef: {
        current: imageNode,
      },
    } = this;
    imageNode.addEventListener('load', () => {
      this.setState({
        loading: false,
      });
    });
  }

  render() {
    const { className, src, alt, } = this.props;
    const { loading, } = this.state;
    if (loading === true) {
      const { id, } = this;
      if (id === undefined)
      this.id = setInterval(() => {
        const { count, } = this.state;
        if (count <= 6) {
          this.setState({
            count: count + 1,
          });
        } else {
          this.setState({
            count: 0,
          });
        }
      }, 150);
    } else {
      const { id, } = this;
      clearInterval(id);
      this.id = undefined;
    }
    const { count, } = this.state;
    return (
      <>
        <Loading loading={loading} className={className} count={count} />
        <img style={{ display: loading ? 'none' : 'inline', }} ref={this.imageRef} className={[className].join(' ')} src={src} alt={alt} />
      </>
    );
  }
}

export default Image;
