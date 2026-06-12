import React from 'react';
import removePathVariables from '~/client/script/lib/util/removePathVariables';
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

  async toLink(link, search, hash) {
    await emitter.send('page' + removePathVariables(pathname), { path, });
  }
}

export default Page;
