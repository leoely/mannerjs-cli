import net from 'net';
import { Router, } from 'advising.js';
import Tackles from './Tackles';

class Blocks extends Tackles {
  constructor(interval) {
    super();
    this.dealParams(interval);
    this.interval = interval;
  }

  dealParams(interval) {
    if (!Number.isInteger(interval)) {
      throw new Error('[Error] The interval parameter should be of integer type.');
    }
    if (interval <= 0) {
      throw new Error('[Error] The interval should be a positive integer otherwise it has no meaning.');
    }
    if (!Number.isInteger(interval / 500)) {
      throw new Error('[Error] The parameter interval should be divisible by 500 milliseconds.');
    }
  }

  examineIpAddress(ip, ipRouter) {
    if (typeof ip !== 'string') {
      throw new Error('[Error] The parameter ip should be of string type.');
    }
    if (!(ipRouter instanceof Router)) {
      throw new Error('[Error] The parameter ipRouter should be the router type.');
    }
    let ans = true;
    const block = ipRouter.gain(ip);
    if (block === undefined) {
      ipRouter.attach(ip, 1);
      const { interval, } = this;
      setTimeout(() => {
        super.cleanTackle(ip);
      }, interval);
    } else {
      let count = block;
      count += 1;
      ipRouter.revise(ip, count);
      ans = false;
    }
    return ans;
  }

  examine(ip) {
    if (typeof ip !== 'string') {
      throw new Error('[Error] The parameter ip should be of string type.');
    }
    if (net.isIPv4(ip)) {
      const { ipv4Router, } = this;
      return this.examineIpAddress(ip, ipv4Router);
    } else if (net.isIPv6(ip)) {
      const { ipv6Router, } = this;
      return this.examineIpAddress(ip, ipv6Router);
    } else {
      throw new Error('[Error] The Ip type is not expected.');
    }
  }
}

export default Blocks;
