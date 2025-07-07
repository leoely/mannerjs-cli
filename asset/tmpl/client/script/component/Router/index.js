import React from 'react';
import style from './index.module.css';
import Loading from '~/client/script/page/Loading';
import UpdateConfirm from '~/client/script/component/UpdateConfirm';
import Container from '~/client/script/component/Container'
import WebApp from '~/client/script/component/WebApp';
import global from '~/client/script/obj/global';

const {
  emitter,
  location,
} = global;

class Router extends WebApp {
  constructor(props) {
    super(props);
    this.system = {};
    this.component = {};
    this.jump = true;
    const { state, } = this;
    this.state = {
      location: '/',
      loading: true,
      unexist: false,
      block: false,
      error: false,
      buzy: false,
      ...state,
    };
  }

  async ownComponentDidMount() {
    await this.bindEvent();
    await emitter.send('page' + window.location.pathname);
    const { jump, } = this;
    switch (jump) {
      case true:
        location.to(window.location.pathname);
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
    emitter.on('page/', async () => {
      if (this.checkRoute('/') === false) {
        const module = await import('~/client/script/page/Home');
        const Home = module.default;
        this.addRoute('/', Home);
      }
      location.to('/');
      this.jump = true;
    });
  }

  addRoute(path, Class) {
    const { component, } = this;
    if (component[path] === undefined) {
      component[path] = <Class />;
    }
  }

  checkRoute(path) {
    const { component, } = this;
    let ans = true;
    if (component[path] === undefined) {
      ans = false;
    }
    return ans;
  }

  getPage(path) {
    const { component, } = this;
    if (component[path] === undefined) {
      this.setState({ loading: true, });
      import('~/client/script/page/NotFound').then((module) => {
        const NotFound = module.default;
        this.system.notFound = <NotFound/>;
        this.setState({ unexist: true, loading: false, });
      });
    }
    return component[path];
  }

  render() {
    const {
      location, update, loading, unexist, block, error, busy,
    } = this.state;
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
