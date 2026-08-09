import { URL, } from 'url';
import net from 'net';
import dns from 'dns';
import { performance, } from 'perf_hooks';
import { HostRouter, } from 'advising.js';
import {
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
      timeInterval: 20,
      logLevel: 0,
    };
    this.options = Object.assign(defaultOptions, options);
    this.dealOptions();
    this.dealParams(port, httpHandles);
    this.getInitIndex();
    this.average = {};
    this.number = {};
    const {
      number,
    } = this;
    number.time = 0;
    number.myself = 0;
    number.redirect = 0;
    this.lookupOptions = {
      family: 0,
      hints: dns.ADDRCONFIG | dns.V4MAPPED,
    };
    this.count = new HostRouter({ logLevel: 0, debug: false, hideError: true, });
  }

  static getDeltaWeightWhenSlaveEnable(m2, r2, f, w) {
    return (m2 + w * r2 - f * m2 - f * w * r2) / (1 - r2);
  }

  static getDeltaWeightWhenSlaveDisable(r1, m2, f) {
    return (m2 * (1 - f)) / r1;
  }

  getLoadValueFactor(l2) {
    const l1 = this.getLoadValue();
    return l1 / l2;
  }

  emptyCache() {
    this.average = {};
    this.number = {};
    const {
      number,
    } = this;
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
      const hostnameHash = {};
      for await (const httpHandle of httpHandles) {
        const [hostname, port] = httpHandle;
        const ip = await this.lookupHostname(hostname);
        hostnameHash[hostname] = ip;
        const {
          port: myselfPort,
        } = this;
        if ((ip === ipv4 || ip === ipv6) && (port === myselfPort)) {
          this.hostname = hostname;
        }
      }
      this.hostnameHash = hostnameHash;
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

  addHttpHandle(httpHandle) {
    this.checkHttpHandle(httpHandle);
    this.httpHandles.push(httpHandle);
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

  getInitIndex() {
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
        timeInterval,
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
    if (!Number.isInteger(timeInterval)) {
      throw new Error('[Error] The option timeInterval should be an integer type.');
    }
    if (!(timeInterval > 0)) {
      throw new Error('[Error] The option timeInterval should be a positive integer type.');
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
    const [address, port] = this.getLoadBalanceHttpHandle();
    const {
      options: {
        protocol,
      },
    } = this;
    const redirectUrl = new URL(protocol + '://' + address + ':' + port + url);
    if (timestamp === true) {
      const time = Date.now();
      redirectUrl.searchParams.set('loadBalanceTime', time);
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
        const {
          hostnameHash,
          port: myselfPort,
        } = this;
        if (hostnameHash === undefined) {
          throw new Error('[Error] Please first call the `this.startUp` method.');
        }
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

  getRedirectValue() {
    const {
      average,
    } = this;
    return average.redirect;
  }

  getMyselfValue() {
    const {
      average,
    } = this;
    return average.myself;
  }

  getLoadValue() {
    const {
      average,
      number,
    } = this;
    const ratio = average.redirect / average.myself;
    return number.myself + number.redirect * ratio;
  }

  clearLoadValue() {
    this.number = {};
    this.average = {};
  }

  recordStartTime() {
    const {
      options: {
        enable,
        timeInterval,
      },
      number,
    } = this;
    number.time += 1;
    if (number.time === timeInterval) {
      number.time = 0;
      if (enable === true) {
        this.startTime = performance.now();
      }
    }
  }

  updateTwoSituationAverage() {
    const {
      number,
      timeInterval,
    } = this;
    if (number.time === timeInterval) {
      const {
        situation,
        startTime,
        average,
      } = this;
      const endTime = performance.now();
      const timeSpent = startTime - endTime;
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
            average.redirec = (timeSpent + average.redirect) / 2;
          }
          break;
        }
      }
      delete this.startTime;
      delete this.situation;
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
    } = this;
    if (enable === true) {
      if (this.checkPointMyself() && site === undefined) {
        this.situation = 0;
        const originHtml = this.getOriginHtml();
        this.updateTwoSituationAverage();
        this.myselfCount += 1;
        return originHtml;
      } else {
        this.situation = 1;
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
            this.redirectCount += 1;
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
              this.redirectCount += 1;
              return compressedHtml;
            } else {
              const newHtml = dom.toString();
              this.updateTwoSituationAverage();
              this.redirectCount += 1;
              return newHtml;
            }
          }
        }
      }
    } else {
      this.situation = 1;
      const originHtml = this.getOriginHtml();
      this.updateTwoSituationAverage();
      this.redirectCount += 1;
      return originHtml;
    }
  }
}

export default LoadBalance;
