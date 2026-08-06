import { URL, } from 'url';
import net from 'net';
import {
  isIntranetIpv4Address,
} from 'manner.js/server';
import htmlParser from 'node-html-parser';
import htmlMinifier from 'html-minifier';

function getModeValue(mode) {
  switch (mode) {
    case 'test':
      return 0;
    case 'default':
      return 1;
  }
}

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

class PortLoadBalance {
  constructor(options = {}, port, httpHandles) {
    const defaultOptions = {
      weight: 0.5,
      mode: 'default',
      protocol: 'https',
      minify: true,
      enable: true,
      first: false,
    };
    this.options = Object.assign(defaultOptions, options);
    this.dealOptions();
    this.dealParams(port, httpHandles);
    this.index = this.getInitIndex();
  }

  static getProcessHeapUsed() {
    const memoryUsage = process.memoryUsage();
    return memoryUsage.heapUsed;
  }

  getInitIndex() {
    const {
      httpHandles: {
        length,
      },
    } = this;
    const value = Math.random() * length;
    return Math.floor(value);
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
    httpHandles.forEach((httpHandle, index) => {
      this.checkHttpHandle(httpHandle, index);
    });
    this.httpHandles = httpHandles;
    this.httpHandles.forEach((httpHandle) => {
      const [address] = httpHandle;
      if (this.type === undefined) {
        if (net.isIP(address)) {
          this.type = 0;
        } else {
          this.type = 1;
        }
      } else {
        const { type, } = this;
        if (net.isIP(address)) {
          if (type === 1) {
            throw new Error('[Error] The elements of the parameter httpHandles should all be of type hostname.');
          }
        } else {
          if (type === 0) {
            throw new Error('[Error] The elements of the parameter httpHandles should all be of type IP.');
          }
        }
      }
    });
  }

  dealOptions() {
    const {
      options: {
        mode,
        weight,
        protocol,
        first,
        minify,
        enable,
      },
    } = this;
    if (typeof weight !== 'number') {
      throw new Error('[Error] The option weight should be a number type.');
    }
    if (!(weight > 0 && weight < 1)) {
      throw new Error('[Error] The option weight should be within a range (0, 1).');
    }
    if (typeof mode !== 'string') {
      throw new Error('[Erorr] The option mode should be a string type.');
    }
    switch (mode) {
      case 'default':
      case 'test':
        this.options.mode = getModeValue(mode);
        break;
      default:
        throw new Error('[Error] The option mode value is no within the set range.')
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

  setFirst(first) {
    if (typeof first !== 'boolean') {
      throw new Error('[Error] The parameter first should be a boolean type.');
    }
    this.first = first;
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

  checkHttpHandle(httpHandle, index) {
    const [address, port] = httpHandle;
    if (/^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/.test(address)) {
      const hostname = address;
      const virtualHost = getVirtualHost(hostname);
      if (/mstr/.test(virtualHost)) {
      } else if (/slv/.test(virtualHost)) {
      } else {
        throw new Error('[Error] Virtual hosts need to belong to a set {mstr, slv}.');
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
        index,
        httpHandles: {
          length,
        },
      } = this;
      if (index === length - 1) {
        return 0;
      } else {
        const {
          index,
        } = this;
        return this.index + 1;
      }
    }
  }

  dealDifferentNode(index) {
    const {
      httpHandles,
      type,
    } = this;
    if (type === 0) {
      const [_, port] = httpHandles[index];
      switch (port) {
        case 80:
        case 443:
          this.index = this.getIndexWhenMaster(index);
          break;
        default:
          this.index = index;
      }
    } else {
      const [hostname, port] = httpHandles[index];
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
      status,
    } = this;
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

  getLocation(url) {
    const [address, port] = this.getLoadBalanceHttpHandle();
    const {
      options: {
        protocol,
      },
    } = this;
    const redirectUrl = new URL(protocol + '://' + address + ':' + port + url);
    const time = Date.now();
    redirectUrl.searchParams.set('loadBalanceTime', time);
    return redirectUrl.toString();
  }

  getRedirectHtml(url) {
    let location;
    if (url !== undefined) {
      if (typeof url !== 'string') {
        throw new Error('[Error] The parameter url should be a string type.');
      }
      location = url;
    } else {
      location = this.getLocation(url);
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
        first,
      },
    } = this;
    if (first === true) {
      this.options.enbale = true;
    }
    const {
      options: {
        enable,
      },
    } = this;
    if (enable === true) {
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
      const {
        options: {
          mode,
        },
      } = this;
      switch (mode) {
        case 1:
          return minifyHtml(dom.toString());
        case 0:
          return dom.toString();
      }
    } else {
      const {
        html,
        options: {
          minify,
        },
      } = this;
      switch (mode) {
        case 1: {
          const {
            options: {
              minify,
            },
          } = this;
          if (minify === true) {
            return minifyHtml(dom.toString());
          } else {
            return dom.toString();
          }
        }
        case 0:
          return dom.toString();
      }
    }
  }
}

export default PortLoadBalance;
