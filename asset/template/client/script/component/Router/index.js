import React from 'react';
import {
  WebRouter,
} from 'browser-advising';
import Loading from '~/client/script/page/Loading';
import Container from '~/client/script/component/Container'
import WebApp from '~/client/script/component/WebApp';
import UpdateConfirm from '~/client/script/component/UpdateConfirm';
import removePathVariables from '~/client/script/lib/util/removePathVariables';
import global from '~/client/script/obj/global';
import * as style from './index.module.css';

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

const sysKey = Symbol('sys');
const compKey = Symbol('comp');
const initDataKey = Symbol('initData');
const ldAcsBlkKey = Symbol('ldAcsBlk');
const ldIntlSvrErrKey = Symbol('ldIntlSvrErr');
const ldLatTooHighKey = Symbol('ldLatTooHigh');
const bindEventKey = Symbol('bindEvent');
const getPageKey = Symbol('getPage');
const addRouteKey = Symbol.for('addRoute');
const checkRouteKey = Symbol.for('checkRoute');
const ownComponentDidMountKey = Symbol.for('ownComponentDidMount');

class Router extends WebApp {
  constructor(props) {
    super(props);
    this[initDataKey]();
    this.state = {
      location: '/',
      update: false,
      status: 0,
      loading: true,
    };
  }

  [initDataKey]() {
    this[sysKey] = {};
    this[compKey] = new WebRouter({
      threshold: 0.05,
      number: 8,
      bond: 5,
      dutyCycle: 10,
      hideError: true,
      interception: undefined,
    });
  }

  async [ownComponentDidMountKey]() {
    const {
      pathname,
      search,
      hash,
    } = window.location;
    const path = pathname + search + hash;
    await this[bindEventKey]();
    if (localStorage.getItem('ip') !== null && localStorage.getItem('time') !== null) {
      this.setState({ loading: true, });
      await this[ldAcsBlkKey]();
      this.setState({
        status: 2,
        loading: false,
      });
    }
    await this.ownComponentDidMount();
    await emitter.send('page' + dealPath(removePathVariables(pathname)), { path, });
    location.to(path);
  }

  async [ldAcsBlkKey]() {
    if (this[sysKey].acsBlk === undefined) {
      const module = await import('~/client/script/page/AccessBlock');
      const AccessBlock = module.default;
      this[sysKey].acsBlk = <AccessBlock/>;
    }
  }

  async [ldIntlSvrErrKey]() {
    if (this[sysKey].internalSvrError === undefined) {
      const module = await import('~/client/script/page/InternalServerError');
      const InternalServerError = module.default;
      this[sysKey].intlSvrErr = <InternalServerError/>;
    }
  }

  async [ldLatTooHighKey]() {
    if (this[sysKey].latTooHigh === undefined) {
      const module = await import('~/client/script/page/LatencyTooHigh');
      const LatencyTooHigh = module.default;
      this[sysKey].latTooHigh = <LatencyTooHigh/>;
    }
  }

  [bindEventKey]() {
    location.onChange((location) => {
      this.setState({
        location,
        loading: false,
      });
    });
    emitter.on('block', async (flag) => {
      if (flag === true) {
        this.setState({ loading: true, });
        await this[ldAcsBlkKey]();
        this.setState({ status: 2, loading: false, });
      } else {
        this.setState({ status: 0, });
      }
    });
    emitter.on('error', async (flag) => {
      if (flag === true) {
        this.setState({ loading: true, });
        await this[ldIntlSvrErr.key]();
        this.setState({ status: 1, loading: false, });
      } else {
        this.setState({ status: 0, });
      }
    });
    emitter.on('busy', async (flag) => {
      if (flag === true) {
        this.setState({ loading: true, });
        await this[ldLatTooHighKey]();
        this.setState({ status: 3, loading: false, })
      } else {
        this.setState({ status: 0, });
      }
    });
    emitter.on('update', (flag) => {
      this.setState({ update: flag, });
    });
  }

  addPage(path, component) {
    emitter.on('page' + dealPath(path), async ({ path, }) => {
      if (this[checkRouteKey](path) === false) {
        this[addRouteKey](path, component);
      }
      location.to(path);
    });
  }

  [addRouteKey](path, Class) {
    path = dealPath(path);
    const { [compKey]: comp, } = this;
    if (comp.gain(dealPath(path)).content === undefined) {
      comp.attach(dealPath(path), <Class />);
      comp.setPathKeys(path);
    }
  }

  [checkRouteKey](path) {
    path = dealPath(path);
    const { [compKey]: comp, } = this;
    let ans = true;
    if (comp.gain(dealPath(path)).content === undefined) {
      ans = false;
    }
    return ans;
  }

  [getPageKey](path) {
    path = dealPath(path);
    const { [compKey]: comp, } = this;
    const {
      content,
      queryParams,
      pathVariables,
    } = comp.gain(dealPath(path));
    if (content === undefined) {
      this.setState({ loading: true, });
      import('~/client/script/page/NotFound').then((module) => {
        const NotFound = module.default;
        this[sysKey].notFound = <NotFound/>;
        this.setState({ status: 4, loading: false, });
      });
    } else {
      global.queryParams = queryParams;
      global.pathVariables = pathVariables;
    }
    return content;
  }

  render() {
    const { loading, } = this.state;
    if (loading === true) {
      return <Loading />;
    }
    const { status, } = this.state;
    switch (status) {
      case 1:
        return this[sysKey].intlSvrErr;
      case 2:
        return this[sysKey].acsBlk;
      case 3:
        return this[sysKey].latTooHigh;
      case 4: {
        const { update, } = this.state;
        const { mode, } = this.props;
        return (
          <div className={style.outer}>
            { update && <UpdateConfirm mode={mode} /> }
            <div id="page" className={style.page}>
              <Container>{this[sysKey].notFound}</Container>
            </div>
          </div>
        );
      }
      case 0: {
        const { update, location, } = this.state;
        const { mode, } = this.props;
        return (
          <div className={style.outer}>
            { update && <UpdateConfirm mode={mode} /> }
            <div id="page" className={style.page}>
              <Container>{this[getPageKey](location)}</Container>
            </div>
          </div>
        );
      }
    }
  }
}

export default Router;
