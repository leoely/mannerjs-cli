import React from 'react';
import global from '~/client/script/obj/global';

const {
  clientFetch,
} = global;

class Image extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      src: '',
    };
  }

  async componentDidMount() {
    const { src, } = this.props;
    const response = await clientFetch.fetch(src);
    const blob = await response.blob();
    this.setState({
      src: URL.createObjectURL(blob),
    });
    const { onLoad, } = this.props;
    if (typeof onLoad === 'function') {
      this.props.onLoad();
    }
  }

  render() {
    const { className, alt, } = this.props;
    const { src, } = this.state;
    if (src === '') {
      return null;
    }
    return (
      <img src={src} className={className} alt={alt}/>
    );
  }
}

export default Image;
