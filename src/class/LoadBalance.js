import { URL, } from 'url';
import net from 'net';
import dns from 'dns';
import { performance, } from 'perf_hooks';
import { HostRouter, } from 'advising.js';
import {
  getAddress,
  getOwnIpAddresses,
  isIntranetIpv4Address,
} from 'manner.js/server';
import htmlParser from 'node-html-parser';
import htmlMinifier from 'html-minifier';

function getVirtualHost(hostname) {
  return hostname.split('.')[0];
}

function minifyHtml(html) {
  return htmlMinifier.minify(html, {
    minifyJS: true,
    collapseWhitespace: true,
    removeAttributeQuotes: true,
    collapseInlineTagWhitespace: true,
    removeAttributeQuotes: true,
    removeComments: true,
    removeEmptyAttributes: true,
    removeEmptyElements: true,
    removeOptionalTags: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    removeTagWhitespace: true,
    trimCustomFragments: true,
  });
}

function transformOptions(options) {
  const {
    mode,
  } = options;
  if (typeof mode !== 'string') {
    if (typeof mode !== 'number') {
      throw new Error('[Erorr] The option mode should be a string type.');
    }
  }
  if (mode !== undefined) {
    switch (mode) {
      case 'default':
        options.mode = 1;
        break;
      case 'test':
        options.mode = 0;
        break;
      default:
        throw new Error('[Error] The option mode value is not within the set range.');
    }
  }
  return options;
}

function handleWeightBoundary(weight) {
  if (weight < 1 && weight > 0) {
    return weight;
  }
  if (weight >= 1) {
    return 1;
  }
  if (weigth <= 0) {
    return 0;
  }
}

function getAverage(average) {
  if (average !== undefined) {
    return average;
  } else {
    return 0;
  }
}

function masterAndSlaveData(masterData, slaveData) {
  if (!(masterData instanceof LoadBalancee)) {
    throw new Error('[Error] The parameter masterData should be of type LoadBalance.');
  }
  const { master: master1, } = masterData;
  if (master1 !== true) {
    throw Error('[Error] The parameter master data should the master flag is true.');
  }
  if (!(slaveData2 instanceof LoadBalancee)) {
    throw new Error('[Error] The parameter slaveData2 should be of type LoadBalance.');
  }
  const { master: master2, } = slaveData;
  if (master2 !== true) {
    throw Error('[Error] The parameter slave data should the master flag is false.');
  }
}

class LoadBalance {
  constructor(options = {}, port, httpHandles) {
    options = transformOptions(options);
    const defaultOptions = {
      weight: 0.5,
      mode: 1,
      protocol: 'https',
      minify: true,
      enable: true,
      orderIndex: false,
      computeInterval: 20,
      logInterval: 30,
      logLevel: 0,
    };
    this.options = Object.assign(defaultOptions, options);
    this.dealOptions();
    this.dealParams(port, httpHandles);
    this.setInitIndex();
    this.average = {};
    this.number = {};
    const {
      number,
    } = this;
    number.digit = 0;
    number.time = 0;
    number.myself = 0;
    number.redirect = 0;
    this.lookupOptions = {
      family: 0,
      hints: dns.ADDRCONFIG | dns.V4MAPPED,
    };
    this.count = new HostRouter({ logLevel: 0, debug: false, hideError: true, });
  }

  static hostnameHash = null;

  static getHostnameHash() {
    const {
      hostnameHash,
    } = LoadBalance;
    if (hostnameHash === null) {
      throw new Error('[Error] Please first call the `this.startUp` method.');
    }
    return hostnameHash
  }

  static getDeltaWeightWhenSlaveEnable(masterData, slaveData) {
    checkMasterAndSlaveData(masterData, slaveData);
    const m2 = slaveData.getMyself();
    const r2 = slaveData.getRedirect();
    const f = LoadBalance.getLoadFactor(masterData, slaveData);
    const w = masterData.getWeight();
    const newWeight = (m2 + w * r2 - f * m2 - f * w * r2) / (1 - r2);
    return handleWeightBoundary(newWeight);
  }

  static getDeltaWeightWhenSlaveDisable(masterData, slaveData) {
    checkMasterAndSlaveData(masterData, slaveData);
    const r1 = masterData.getRedirect();
    const m2 = slaveData.getMyself();
    const f = LoadBalance.getLoadFactor(masterData, slaveData);
    const newWeight = (m2 * (1 - f)) / r1;
    return handleWeightBoundary(newWeight);
  }

  static getLoadFactor(masterData, slaveData) {
    checkMasterAndSlaveData(masterData, slaveData);
    const l1 = masterData.getLoad();
    const l2 = slaveData.getLoad();
    return l1 / l2;
  }

  static removeHttpHandle(httpHandle, loadBalances) {
    const loadBalance = loadBalances[0];
    const { type, } = loadBalance;
    loadBalances.forEach((loadBalance) => {
      loadBalance.removeHttpHandle(httpHandle);
    });
    switch (type) {
      case 0:
      case 1: {
        const [_, port] = httpHandle;
        switch (port) {
          case 80:
          case 443:
            LoadBalance.generateNewMaster(httpHandle, loadBalance);
            break;
        }
        break;
      }
      case 2: {
        const [address] = httpHandle;
        const virtualHost = getVirtualHost(address);
        if (/mstr/.test(virtualHost)) {
          LoadBalance.generateNewMaster(httpHandle, loadBalance);
        }
        break;
      }
    }
  }

  static generateNewMaster(httpHandle, loadBalances) {
    const hostnameHash = LoadBalance.getHostnameHash();
    const loadBalance = loadBalances[0];
    const { type, } = loadBalance;
    const [address, port] = httpHandle;
    let ip;
    switch (type) {
      case 0:
      case 1:
        ip = address;
        break;
      case 2:
        ip = hostnameHash[address];
        break;
    }
    let minLoad = Infinity;
    let minLoadBalance;
    loadBalances.forEach((loadBalance) => {
      const { ipv4, ipv6, } = loadBalance;
      if (ip === ipv4 || ip === ipv6) {
        const load = loadBalance.getLoad();
        if (minLoad > load) {
          minLoad = load;
          minLoadBalance = loadBalance;
        }
      }
    });
    minLoadBalance.port = port;
    return;
  }

  setAllHttpHandles(httpHandles) {
    this.checkHttpHandle(httpHandle);
    this.httpHandles = httpHandles;
  }

  emptyCache() {
    this.average = {};
    this.number = {};
    const {
      number,
    } = this;
    number.digit = 0;
    number.redirect = 0;
    number.myself = 0;
    number.time = 0;
    const {
      count,
    } = this;
    count.ruinAll();
  }

  async startUp() {
    const {
      type,
    } = this;
    const [addr] = getOwnIpAddresses();
    const { ipv4, ipv6, } = addr;
    this.ipv4 = ipv4;
    this.ipv6 = ipv6;
    if (type === 2) {
      const { httpHandles, } = this;
      let flag = false;
      if (LoadBalance.hostnameHash === null) {
        LoadBalance.hostnameHash = {};
        flag = true;
      }
      for await (const httpHandle of httpHandles) {
        const [hostname, port] = httpHandle;
        const ip = await this.lookupHostname(hostname);
        if (flag === true) {
          const hostnameHash = LoadBalance.hostnameHash;
          hostnameHash[hostname] = ip;
        }
        const {
          options: {
            mode,
          },
          port: myselfPort,
        } = this;
        if (mode === 0 && ip === '127.0.0.1' && port === myselfPort) {
          this.hostname = hostname;
          break;
        }
        if ((ip === ipv4 || ip === ipv6) && (port === myselfPort)) {
          this.hostname = hostname;
          break;
        }
      }
    }
    switch (type) {
      case 0:
      case 1: {
        const { port, } = this;
        switch (port) {
          case 80:
          case 443:
            this.master = true;
          default:
            this.master = false;
        }
        break;
      }
      case 2: {
        const { hostname, } = this;
        const virtualHost = getVirtualHost(hostname);
        if (/mstr/.test(virtualHost)) {
          this.master = true;
        } else {
          this.master = false;
        }
        break;
      }
      default:
        throw new Error('[Error] Current internal state is abnormal.');
    }
  }

  checkHttpHandle(httpHandle) {
    const [address, port] = httpHandle;
    if (/^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/.test(address)) {
      const hostname = address;
      const virtualHost = getVirtualHost(hostname);
      if (/mstr/.test(virtualHost)) {
      } else if (/slv/.test(virtualHost)) {
      } else {
        throw new Error('[Error] The virtual host of the httpHandle parameter need to belong to a set {mstr, slv}.');
      }
      const {
        type,
      } = this;
      switch (type) {
        case 0:
          throw new Error('[Error] The address of the httpHandle parameter should be of ipv4 type.');
        case 1:
          throw new Error('[Error] The address of the httpHandle parameter should be of ipv6 type.');
      }
    } else if (net.isIP(address)) {
      if (net.isIPv4(address)) {
        const {
          mode,
        } = this;
        if (mode === 1 && isIntranetIpv4Address(address)) {
          throw new Error('[Error] Internal IP addresses are not used in the default mode.');
        }
        const {
          type,
        } = this;
        switch (type) {
          case 1:
            throw new Error('[Error] The address of the httpHandle parameter should be of ipv6 type.');
          case 2:
            throw new Error('[Error] The address of the httpHandle parameter should be of hostname type.');
        }
      } else {
        const {
          type,
        } = this;
        switch (type) {
          case 0:
            throw new Error('[Error] The address of the httpHandle parameter should be of ipv4 type.');
          case 2:
            throw new Error('[Error] The address of the httpHandle parameter should be of hostname type.');
        }
      }
    } else {
      throw new Error('[Error] The address of the httpHandle parameter is not a valid domain name or IP address.');
    }
    if (!Number.isInteger(port)) {
      throw new Error('[Error] The port of the httpHandle parameter should be an integer type.');
    }
    if (!(port > 0)) {
      throw new Error('[Error] The port of the  httpHandle parameter should be a  postive integer type.');
    }
  }

  removeHttpHandle(httpHandle) {
    this.checkHttpHandle(httpHandle);
    const {
      httpHandles,
    } = this;
    let remove = false;
    httpHandles.filter(([address, port]) => {
      if (address === httpHandle.address && port === httpHandle.port) {
        remove = true;
        return false;
      } else {
        return true;
      }
    });
    if (remove === false) {
      throw new Error('[Error] The httpHandle that needs to be removed dost not exist,the deletion did not take effect.');
    }
  }

  setInitIndex() {
    const {
      options: {
        orderIndex,
      },
    } = this;
    if (orderIndex === true) {
      const {
        options: {
          weight,
        },
      } = this;
      if (weight === 0) {
        this.index = 0;
      } else {
        this.index = -1;
      }
    } else {
      const {
        httpHandles: {
          length,
        },
      } = this;
      const value = Math.random() * length;
      this.index = Math.floor(value);
    }
  }

  dealParams(port, httpHandles) {
    if (!Number.isInteger(port)) {
      throw new Error('[Error] The param port should be an integer type.');
    }
    if (!(port > 0)) {
      throw new Error('[Error] The param port should be a positvie integer type.')
    }
    if (!Array.isArray(httpHandles)) {
      throw new Error('[Error] The parameter httpHandles should be array type.');
    }
    if (!(httpHandles.length > 0)) {
      throw new Error('[Error] The parameter httpHandles length must be greater than zero;otherwise,itis meaningless.');
    }
    this.port = port;
    httpHandles.forEach((httpHandle, index) => {
      const [address, port] = httpHandle;
      if (/^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/.test(address)) {
        const hostname = address;
        const virtualHost = getVirtualHost(hostname);
        if (/mstr/.test(virtualHost)) {
        } else if (/slv/.test(virtualHost)) {
        } else {
          throw new Error('[Error] The virtual host of the' + index + ' element  of the httpHandless parameter need to belong to a set {mstr, slv}.');
        }
      } else if (net.isIP(address)) {
        if (net.isIPv4(address)) {
          const {
            mode,
          } = this;
          if (mode === 1 && isIntranetIpv4Address(address)) {
            throw new Error('[Error] Internal IP addresses are not used in the default mode.');
          }
        }
      } else {
        throw new Error('[Error] The address of the ' + index + ' element of the httpHandles parameter is not a valid domain name or IP address.');
      }
      if (!Number.isInteger(port)) {
        throw new Error('[Error] The port of the ' + index + ' element of the httpHandles parameter should be an integer type.');
      }
      if (!(port > 0)) {
        throw new Error('[Error] The port of the ' + index + ' element of the httpHandles parameter should be a  postive integer type.');
      }
      if (this.type === undefined) {
        if (net.isIP(address)) {
          if (net.isIPv4(address)) {
            this.type = 0;
          } else {
            this.type = 1;
          }
        } else {
          this.type = 2;
        }
      } else {
        const { type, } = this;
        if (net.isIP(address)) {
          if (net.isIPv4(address)) {
            switch (type) {
              case 1:
                throw new Error('[Error] The elements of the parameter httpHandles should all be of type IPv6.');
                break;
              case 2:
                throw new Error('[Error] The elements of the parameter httpHandles should all be of type hostname.');
                break;
            }
          } else {
            switch (type) {
              case 0:
                throw new Error('[Error] The elements of the parameter httpHandles should all be of type IPv4.');
                break;
              case 2:
                throw new Error('[Error] The elements of the parameter httpHandles should all be of type hostname.');
                break;
            }
          }
        } else {
          switch (type) {
            case 0:
              throw new Error('[Error] The elements of the parameter httpHandles should all be of type hostname.');
              break;
            case 1:
              throw new Error('[Error] The elements of the parameter httpHandles should all be of type hostname.');
              break;
          }
        }
      }
    });
    this.httpHandles = httpHandles;
  }

  dealOptions() {
    const {
      options: {
        mode,
        weight,
        protocol,
        minify,
        enable,
        orderIndex,
        computeInterval,
        logLevel,
      },
    } = this;
    if (typeof weight !== 'number') {
      throw new Error('[Error] The option weight should be a number type.');
    }
    if (!(weight >= 0 && weight <= 1)) {
      throw new Error('[Error] The option weight should be within a range [0, 1].');
    }
    if (typeof protocol !== 'string') {
      throw new Error('[Erorr] The option protocol should be a string type.');
    }
    if (typeof minify !== 'boolean') {
      throw new Error('[Error] The option minify should be of boolean type.')
    }
    if (typeof enable !== 'boolean') {
      throw new Error('[Error] The option enable should be of boolean type.');
    }
    if (typeof orderIndex !== 'boolean') {
      throw new Error('[Error] The options orderIndex should be of boolean type.');
    }
    if (!Number.isInteger(computeInterval)) {
      throw new Error('[Error] The option computeInterval should be an integer type.');
    }
    if (!(computeInterval > 0)) {
      throw new Error('[Error] The option computeInterval should be a positive integer type.');
    }
    if (!Number.isInteger(logLevel)) {
      throw new Error('[Error] The option logLevel should be an integer type.');
    }
    if (!(logLevel === 0 || logLevel === 1 || logLevel === 2)) {
      throw new Error('[Error] The option logLevel should be in the set {0, 1, 2}.');
    }
  }

  lookupHostname(hostname) {
    const {
      options: {
        mode,
      },
    } = this;
    switch (mode) {
      case 0: {
        const {
          hostnameResolve,
        } = this;
        if (hostnameResolve === undefined) {
          return this.lookupPromises(hostname);
        } else {
          return Promise.resolve(hostnameResolve[hostname]);
        }
      }
      case 1: {
        return this.lookupPromises(hostname);
      }
    }
  }

  lookupPromises(hostname) {
    const {
      lookupOptions: options,
    } = this;
    return new Promise((resolve, reject) => {
      dns.lookup(hostname, options, (err, address, family) => {
        if (err === null) {
          resolve(address);
        } else {
          reject(err);
        }
      });
    });
  }

  setWeight(weight) {
    if (typeof weight !== 'number') {
      throw new Error('[Error] The parameter weight should be a number type.');
    }
    if (!(weight > 0 && weight < 1)) {
      throw new Error('[Error] The parameter weight should be within a range (0, 1).');
    }
    this.options.weight = weight;
    this.loadBlance = Date.now();
  }

  setHtml(html) {
    if (typeof html !== 'string') {
      throw new Error('[Error] The parameter html should be a string.');
    }
    this.html = html;
    this.dom = htmlParser.parse(html);
  }

  setEnable(enable) {
    if (typeof enable !== 'boolean') {
      throw new Error('[Error] The parameter enable should be a boolean type.');
    }
    this.options.enable = enable;
    const {
      options,
    } = this;
    switch (options.enable) {
      case true:
        delete this.loadBalanceTime;
        break;
      case false:
        this.loadBalanceTime = Date.now();
        break;
    }
  }

  setTemporaryHostnameResolve(hostnameResolve) {
    if (!(typeof hostnameResolve === 'object' && !Array.isArray(hostnameResolve) && hostnameResolve !== null)) {
      throw new Error('[Error] The parameter hostnameResolve should be an object type.');
    }
    this.hostnameResolve = hostnameResolve;
  }

  getIndexWhenMaster(index) {
    const {
      options: {
        weight,
      },
    } = this;
    const value = Math.random();
    if (value < weight) {
      return index;
    } else {
      const {
        httpHandles: {
          length,
        },
        index,
      } = this;
      if (index === length - 1) {
        return 0;
      } else {
        return index + 1;
      }
    }
  }

  dealDifferentNode(index) {
    const {
      httpHandles,
      type,
    } = this;
    const httpHandle = httpHandles[index];
    if (type === 0) {
      const [_, port] = httpHandle;
      switch (port) {
        case 80:
        case 443:
          this.index = this.getIndexWhenMaster(index);
          break;
        default:
          this.index = index;
      }
    } else {
      const [hostname, port] = httpHandle;
      const virtualHost = getVirtualHost(hostname);
      if (/mstr/.test(virtualHost)) {
        this.index = this.getIndexWhenMaster(index);
      } else if (/slv/.test(virtualHost)) {
        this.index = index;
      } else {
        throw new Error('[Error] Virtual hosts need to belong to a set {mstr, slv}.');
      }
    }
  }

  getLoadBalanceHttpHandle() {
    const {
      httpHandles: {
        length,
      },
    } = this;
    if (this.index === length - 1) {
      this.dealDifferentNode(0);
    } else {
      const {
        index,
      } = this;
      this.dealDifferentNode(index + 1);
    }
    const {
      index,
      httpHandles,
    } = this;
    const httpHandle = httpHandles[index];
    return httpHandle;
  }

  getLocation(url, timestamp) {
    if (typeof url !== 'string') {
      throw new Error('[Error] The parameter url should be a string.');
    }
    if (timestamp !== undefined) {
      if (typeof timestamp !== 'boolean') {
        throw new Error('[Error] The parameter timestamp should a boolean type.');
      }
    }
    const [hostname, port] = this.getLoadBalanceHttpHandle();
    const {
      options: {
        protocol,
      },
    } = this;
    const redirectUrl = new URL(protocol + '://' + hostname + ':' + port + url);
    if (timestamp === true) {
      const time = Date.now();
      redirectUrl.searchParams.set('loadBalanceTime', time);
    }
    const {
      options: {
        logInterval,
      },
      number,
    } = this;
    if (number.digit === logInterval) {
      number.digit = 0;
      const {
        count,
      } = this;
      const address = getAddress(hostname, port);
      let number = count.gain(address);
      if (number === undefined) {
        number = 1;
      } else {
        number += 1;
      }
      count.attach(address, number);
    } else {
      number.digit += 1;
    }
    return redirectUrl.toString();
  }

  checkPointMyself() {
    const {
      index,
      httpHandles,
    } = this;
    const httpHandle = httpHandles[index];
    const {
      type,
    } = this;
    switch (type) {
      case 0: {
        let myselfIP;
        switch (type) {
          case 0:
            myselfIP = this.ipv4;
            break;
          case 1:
            myselfIP = this.ipv6;
            break;
        }
        const [IP, port] = httpHandle;
        const {
          port: myselfPort,
        } = this;
        if (myselfIP === IP && myselfPort === port) {
          return true;
        } else {
          return false;
        }
      }
      case 2: {
        const hostnameHash = LoadBalance.getHostnameHash();
        const {
          port: myselfPort,
        } = this;
        const [hostname, port] = httpHandle;
        const IP = hostnameHash[hostname];
        const {
          options: {
            mode,
          },
          ipv4, ipv6,
        } = this;
        if (ipv4 === IP && myselfPort === port) {
          return true;
        } else if (ipv6 === IP && myselfPort === port) {
          return true;
        } else if (mode === 0 && IP === '127.0.0.1' && myselfPort === port) {
          return true;
        } else {
          return false;
        }
      }
    }
  }

  getOriginHtml() {
    const {
      html,
      options: {
        minify,
      },
    } = this;
    if (minify === true) {
      return minifyHtml(html);
    } else {
      return html;
    }
  }

  getData() {
    const weight = this.getWeight();
    const redirect = this.getRedirect();
    const myself = this.getMyself();
    const load = this.getLoad();
    const {
      master,
    } = this;
    return {
      weight,
      redirect,
      myself,
      load,
      master,
    };
  }

  getWeight() {
    const {
      options: {
        weight,
      },
    } = this;
    return weight;
  }

  getRedirect() {
    const {
      average,
    } = this;
    return getAverage(average.redirect);
  }

  getMyself() {
    const {
      average,
    } = this;
    return getAverage(average.myself);
  }

  getLoad() {
    const {
      average,
      number,
    } = this;
    const ratio = average.redirect / average.myself;
    return number.myself + number.redirect * ratio;
  }

  clearLoadValue() {
    this.number = {};
    const { number, } = this;
    number.digit = 0;
    number.time = 0;
    number.myself = 0;
    number.redirect = 0;
    this.average = {};
  }

  recordStartTime() {
    const {
      options: {
        enable,
        computeInterval,
      },
      number,
    } = this;
    if (number.time === computeInterval) {
      if (enable === true) {
        this.startTime = performance.now();
      }
    }
  }

  updateTwoSituationAverage() {
    const {
      number,
      options: {
        computeInterval,
      },
    } = this;
    if (number.time === computeInterval) {
      number.time = 0;
      const {
        situation,
        startTime,
        average,
      } = this;
      const endTime = performance.now();
      const timeSpent = endTime - startTime;
      switch (situation) {
        case 0: {
          if (average.myself === undefined) {
            average.myself = timeSpent;
          } else {
            average.myself = (timeSpent + average.myself) / 2;
          }
          break;
        }
        case 1: {
          if (average.redirect === undefined) {
            average.redirect = timeSpent;
          } else {
            average.redirect = (timeSpent + average.redirect) / 2;
          }
          break;
        }
      }
      delete this.startTime;
      delete this.situation;
    } else {
        number.time += 1;
    }
  }

  getHtmlContent(url, site) {
    let location;
    if (site !== undefined) {
      if (typeof site !== 'string') {
        throw new Error('[Error] The parameter site should be a string type.');
      }
      location = site;
    } else {
      this.recordStartTime();
      location = this.getLocation(url, true);
    }
    const {
      dom,
      loadBalanceTime,
    } = this;
    if (dom === undefined) {
      throw new Error('[Error] Please first set the load balancing related HTML content use the setHtml method.');
    }
    const {
      options: {
        enable,
      },
      number,
    } = this;
    if (enable === true) {
      if (this.checkPointMyself() && site === undefined) {
        this.situation = 0;
        number.myself += 1;
        const originHtml = this.getOriginHtml();
        this.updateTwoSituationAverage();
        return originHtml;
      } else {
        this.situation = 1;
        number.redirect += 1;
        const redirectNode = htmlParser.parse(`
          <script>
            const parsedUrl = new URL(window.location);
            const loadBalanceTimeValue = parsedUrl.searchParams.get('loadBalanceTime')
            const loadBalanceTime = parseInt(loadBalanceTimeValue);
            if (Number.isNaN(loadBalanceTime) || (loadBalanceTime <= ${loadBalanceTime})) {
              window.location = '${location}';
            }
          </script>
        `);
        const scriptNode = dom.querySelector('script');
        scriptNode.before(redirectNode);
        const allLinkNode = dom.querySelectorAll('link');
        allLinkNode.forEach((linkNode) => {
          linkNode.remove();
        });
        const bodyNode = dom.querySelector('body');
        bodyNode.innerHTML = '';
        const {
          options: {
            mode,
          },
        } = this;
        switch (mode) {
          case 1:
            const compressedHtml = minifyHtml(dom.toString());
            this.updateTwoSituationAverage();
            return compressedHtml;
          case 0: {
            const {
              options: {
                minify,
              },
            } = this;
            if (minify === true) {
              const compressedHtml = minifyHtml(dom.toString());
              this.updateTwoSituationAverage();
              return compressedHtml;
            } else {
              const newHtml = dom.toString();
              this.updateTwoSituationAverage();
              return newHtml;
            }
          }
        }
      }
    } else {
      this.situation = 0;
      number.myself += 1;
      const originHtml = this.getOriginHtml();
      this.updateTwoSituationAverage();
      return originHtml;
    }
  }
}

export default LoadBalance;
