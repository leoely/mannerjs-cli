import net from 'net';
import { Ipv4Router, Ipv6Router, } from 'advising.js';

class Tackles {
  constructor() {
    this.ipv4Router = new Ipv4Router({ debug: false, hideError: true, });
    this.ipv6Router = new Ipv6Router({ debug: false, hideError: true, });
  }

  getCount(ip) {
    if (net.isIPv4(ip)) {
      const { ipv4Router, } = this;
      return ipv4Router.gain(ip);
    } else if (net.isIPv6(ip)) {
      const { ipv6Router, } = this;
      return ipv6Router.gain(ip);
    } else {
      throw new Error('[Error] The Ip type is not expected.');
    }
  }

  cleanTackle(ip) {
    if (typeof ip !== 'string') {
      throw new Error('[Error] The parameter ip should be of string type.');
    }
    let ipRouter;
    if (net.isIPv4(ip)) {
      ipRouter = this.ipv4Router;
    } else if (net.isIPv6(ip)) {
      ipRouter = this.ipv6Router;
    } else {
      throw new Error('[Error] The Ip type is not expected');
    }
    ipRouter.ruin(ip);
  }
}

export default Tackles;
