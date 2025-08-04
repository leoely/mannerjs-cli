import React from 'react';
import {
  WebRouter,
} from 'browser-advising';
import Loading from '~/client/script/page/Loading';
import UpdateConfirm from '~/client/script/component/UpdateConfirm';
import Container from '~/client/script/component/Container'
import WebApp from '~/client/script/component/WebApp';
import global from '~/client/script/obj/global';
import style from './index.module.css';

const {
  emitter,
  location,
} = global;

function dealPath(path) {
  if (/^\/$/.test(path)) {
    return  path.replace('/', '/index');
  } else if (/^\/\?/.test(path)) {
    return  path.replace('/', '/index');
  } else if (/^\/\/\//.test(path)) {
    return  path.replace('/', '/index');
  } else {
    return path;
  }
}

function removePathVariables(pathname) {
  let i;
  outer: for (i = pathname.length - 1; i >= 1; i -= 1) {
    const char = pathname.charAt(i);
    switch (char) {
      case '/': {
        const prevChar = pathname.charAt(i - 1);
        if (prevChar === '/') {
          break outer;
        }
      }
    }
  }
  if (i <= 1) {
    return pathname;
  } else {
    return pathname.substring(0, i - 2 + 1);
  }
}


class Router extends WebApp {
  constructor(props) {
    super(props);
    this.system = {};
    this.jump = true;
    const { state, } = this;
    this.state = {
      location: '/',
      loading: true,
      block: false,
      error: false,
      buzy: false,
      unexist: false,
      ...state,
    };
    this.component = new WebRouter({
      threshold: 0.05,
      number: 8,
      bond: 5,
      dutyCycle: 10,
      interception: undefined,
      hideError: true,
    });
  }

  async ownComponentDidMount() {
    const {
      pathname,
      search,
      hash,
    } = window.location;
    const path = pathname + search + hash;
    await this.bindEvent();
    await emitter.send('page' + removePathVariables(pathname), { path, });
    const { jump, } = this;
    switch (jump) {
      case true:
        location.to(path);
        this.jump = false;
        break;
    }
    if (localStorage.getItem('ip') !== null && localStorage.getItem('time') !== null) {
      this.setState({ loading: true, });
      await this.loadAccessBlock();
      this.setState({
        block: true,
        loading: false,
      });
    }
  }

  async loadAccessBlock() {
    if (this.system.accessBlock === undefined) {
      const module = await import('~/client/script/page/AccessBlock');
      const AccessBlock = module.default;
      this.system.accessBlock = <AccessBlock/>;
    }
  }

  async loadInternalServerError() {
    if (this.system.internalServerError === undefined) {
      const module = await import('~/client/script/page/InternalServerError');
      const InternalServerError = module.default;
      this.system.internalServerError = <InternalServerError/>;
    }
  }

  async loadLatencyTooHigh() {
    if (this.system.latencyTooHigh === undefined) {
      const module = await import('~/client/script/page/LatencyTooHigh');
      const LatencyTooHigh = module.default;
      this.system.latencyTooHigh = <LatencyTooHigh/>;
    }
  }

  bindEvent() {
    location.onChange((location) => {
      this.setState({
        location,
        loading: false,
      });
    });
    emitter.on('block:true', async () => {
      this.setState({ loading: true, });
      await this.loadAccessBlock();
      this.setState({ block: true, loading: false, });
    });
    emitter.on('block:false', () => {
      this.setState({ block: false, });
    });
    emitter.on('error:true', async () => {
      this.setState({ loading: true, });
      await this.loadInternalServerError();
      this.setState({ error: true, loading: false, });
    });
    emitter.on('error:false', () => {
      this.setState({ error: false, });
    });
    emitter.on('busy:true', async () => {
      this.setState({ loading: true, });
      await this.loadLatencyTooHigh();
      this.setState({ busy: true, loading: false, })
    });
    emitter.on('busy:false', () => {
      this.setState({ busy: false, });
    });
    emitter.on('update:false', () => {
      this.setState({ update: false, });
    });
    emitter.on('page/', async ({ path, }) => {
      if (this.checkRoute('/') === false) {
        const module = await import('~/client/script/page/Home');
        const Home = module.default;
        this.addRoute('///{name}', Home);
      }
      location.to(path);
      this.jump = true;
    });
  }

  addRoute(path, Class) {
    path = dealPath(path);
    const { component, } = this;
    if (component.gain(path).content === undefined) {
      component.attach(path, <Class />);
      component.setPathKeys(path);
    }
  }

  checkRoute(path) {
    path = dealPath(path);
    const { component, } = this;
    let ans = true;
    if (component.gain(path).content === undefined) {
      ans = false;
    }
    return ans;
  }

  getPage(path) {
    path = dealPath(path);
    const { component, } = this;
    const {
      content,
      queryParams,
      pathVariables,
    } = component.gain(path);
    if (content === undefined) {
      this.setState({ loading: true, });
      import('~/client/script/page/NotFound').then((module) => {
        const NotFound = module.default;
        this.system.notFound = <NotFound/>;
        this.setState({ unexist: true, loading: false, });
      });
    } else {
      global.queryParams = queryParams;
      global.pathVariables = pathVariables;
    }
    return content;
  }

  render() {
    const { location, update, loading, unexist, block, error, busy, } = this.state;
    if (loading === true) {
      return <Loading />;
    }
    if (error === true) {
      return this.system.internalServerError;
    }
    if (block === true) {
      return this.system.accessBlock;
    }
    if (busy === true) {
      return this.system.latencyTooHigh;
    }
    if (unexist === true) {
      return (
        <>
          { update && <UpdateConfirm /> }
          <div id="page" className={style.page}>
            <Container>{this.system.notFound}</Container>
          </div>
        </>
      );
    }
    return (
      <>
        { update && <UpdateConfirm /> }
        <div id="page" className={style.page}>
          <Container>{this.getPage(location)}</Container>
        </div>
      </>
    );
  }
}

export default Router;
