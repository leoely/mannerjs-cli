import React from 'react';
import global from '~/client/script/obj/global';

const {
  clientFetch,
} = global;

class Page extends React.Component {
  constructor(props) {
    super(props);
  }

  async componentWillUnmount() {
    clientFetch.renew();
    clientFetch.setHasTimeout(true);
    if (typeof this.ownComponentWillUnmount === 'function') {
      await this.ownComponentWillUnmount();
    }
  }
}

export default Page;
