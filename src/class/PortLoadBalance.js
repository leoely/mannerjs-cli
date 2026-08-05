import net from 'net';
import {
  isIntranetIpv4Address,
} from 'manner.js/server';

function getModeValue(mode) {
  switch (mode) {
    case 'default':
      return 1;
    case 'test':
      return 0;
  }
}

function getVirtualHost(hostname) {
  return hostname.split('.')[0];
}

class PortLoadBalance {
  constructor(options = {}, port, httpHandles) {
    const defaultOptions = {
      weight: 0.5,
      mode: 'default',
      protocol: 'https',
    };
    this.options = Object.assign(defaultOptions, options);
    this.dealOptions();
    this.dealParams(port, httpHandles);
    const {
      httpHandles: {
        length,
      },
    } = this;
    const value = Math.random() * length;
    this.index = Math.floor(value);
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
    const [address] = this.httpHandles[0];
    if (net.isIP(address)) {
      this.type = 0;
    } else {
      this.type = 1;
    }
  }

  dealOptions() {
    const {
      options: {
        mode,
        weight,
        protocol,
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
    if (typeof protocol !== 'string') {
      throw new Error('[Erorr] The option protocol should be a string type.');
    }
    switch (mode) {
      case 'default':
      case 'test':
        this.options.mode = getModeValue(mode);
        break;
      default:
        throw new Error('[Error] The option mode value is no within the set range.')
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

  getIndexByMaster(index) {
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
          this.index = this.setIndexByMaster(index);
          break;
        default:
          this.index = index;
      }
    } else {
      const [hostname, port] = httpHandles[index];
      const virtualHost = getVirtualHost(hostname);
      if (/mstr/.test(virtualHost)) {
        this.index = this.getIndexByMaster(index);
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
    return protocol + '://' + address + ':' + port + url;
  }
}

export default PortLoadBalance;
