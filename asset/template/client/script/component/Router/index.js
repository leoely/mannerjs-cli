import React from 'react';
import {
  WebRouter,
} from 'browser-advising';
import Loading from '~/client/script/page/Loading';
import Container from '~/client/script/component/Container'
import WebApp from '~/client/script/component/WebApp';
import UpdateConfirm from '~/client/script/component/UpdateConfirm';
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
  for (i = pathname.length - 1; i >= 1; i -= 1) {
    const char = pathname.charAt(i);
    if (char === '/') {
      const prevChar = pathname.charAt(i - 1);
      if (prevChar === '/') {
        break;
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
    this.sys = {};
    const wr = new WebRouter({
      threshold: 0.05,
      number: 8,
      bond: 5,
      dutyCycle: 10,
      hideError: true,
      interception: undefined,
    });
    this.comp = wr;
    this.state = {
      location: '/',
      update: false,
      status: 0,
      loading: true,
    };
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
    location.to(path);
    if (localStorage.getItem('ip') !== null && localStorage.getItem('time') !== null) {
      this.setState({ loading: true, });
      await this.loadAccessBlock();
      this.setState({
        status: 2,
        loading: false,
      });
    }
  }

  async loadAccessBlock() {
    if (this.sys === undefined) {
      const module = await import('~/client/script/page/AccessBlock');
      const AccessBlock = module.default;
      this.sys.accessBlock = <AccessBlock/>;
    }
  }

  async loadInternalServerError() {
    if (this.sys.internalServerError === undefined) {
      const module = await import('~/client/script/page/InternalServerError');
      const InternalServerError = module.default;
      this.sys.internalServerError = <InternalServerError/>;
    }
  }

  async loadLatencyTooHigh() {
    if (this.sys.latencyTooHigh === undefined) {
      const module = await import('~/client/script/page/LatencyTooHigh');
      const LatencyTooHigh = module.default;
      this.sys.latencyTooHigh = <LatencyTooHigh/>;
    }
  }

  bindEvent() {
    location.onChange((location) => {
      this.setState({
        location,
        loading: false,
      });
    });
    emitter.on('block', async (flag) => {
      if (flag === true) {
        this.setState({ loading: true, });
        await this.loadAccessBlock();
        this.setState({ status: 2, loading: false, });
      } else {
        this.setState({ status: 0, });
      }
    });
    emitter.on('error', async (flag) => {
      if (flag === true) {
        this.setState({ loading: true, });
        await this.loadInternalServerError();
        this.setState({ status: 1, loading: false, });
      } else {
        this.setState({ status: 0, });
      }
    });
    emitter.on('busy', async (flag) => {
      if (flag === true) {
        this.setState({ loading: true, });
        await this.loadLatencyTooHigh();
        this.setState({ status: 3, loading: false, })
      } else {
        this.setState({ status: 0, });
      }
    });
    emitter.on('update', (flag) => {
      this.setState({ flag, });
    });
    emitter.on('page/', async ({ path, }) => {
      if (this.checkRoute('/') === false) {
        const module = await import('~/client/script/page/Home');
        const Home = module.default;
        this.addRoute('/', Home);
      }
      location.to(path);
    });
  }

  addRoute(path, Class) {
    path = dealPath(path);
    const { comp, } = this;
    if (comp.gain(path).content === undefined) {
      comp.attach(path, <Class />);
      comp.setPathKeys(path);
    }
  }

  checkRoute(path) {
    path = dealPath(path);
    const { comp, } = this;
    let ans = true;
    if (comp(path).content === undefined) {
      ans = false;
    }
    return ans;
  }

  getPage(path) {
    path = dealPath(path);
    const { comp, } = this;
    const {
      content,
      queryParams,
      pathVariables,
    } = comp.gain(path);
    if (content === undefined) {
      this.setState({ loading: true, });
      import('~/client/script/page/NotFound').then((module) => {
        const NotFound = module.default;
        this.sys.notFound = <NotFound/>;
        this.setState({ status: 4, loading: false, });
      });
    } else {
      global.queryParams = queryParams;
      global.pathVariables = pathVariables;
    }
    return content;
  }

  render() {
    const { location, update, loading, } = this.state;
    if (loading === true) {
      return <Loading />;
    }
    switch (status) {
      case 1:
        return this.sys.internalServerError;
      case 2:
        return this.sys.accessBlock;
      case 3:
        return this.sys.latencyTooHigh;
      case 4:
        return (
          <>
            { update && <UpdateConfirm /> }
            <div id="page" className={style.page}>
              <Container>{this.sys.notFound}</Container>
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
