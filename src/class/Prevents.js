import http from 'http';
import net from 'net';
import { Router, } from 'advising.js';
import { parseHttpDate, } from 'manner.js/server';
import Tackles from './Tackles';

class Prevents extends Tackles {
  constructor(threshold, interval) {
    super();
    this.dealParams(threshold, interval);
    this.threshold = threshold;
    this.interval = interval;
  }

  dealParams(threshold, interval) {
    if (!Number.isInteger(threshold)) {
      throw new Error('[Error] The parameter threshold should be of integer type.');
    }
    if (!(threshold > 0)) {
      throw new Error('[Error] The parameter threshold should be of positive integer type.');
    }
    if (!Number.isInteger(interval)) {
      throw new Error('[Error] The parameter interval should be of integer type.');
    }
    if (!(interval > 0)) {
      throw new Error('[Error] The parameter interval should be of positive integer type.');
    }
  }

  inspectStaticFile(ip, req, ipRouter) {
    if (typeof ip !== 'string') {
      throw new Error('[Error] The parameter ip should be of string type.');
    }
    if (req instanceof http.ClientRequest) {
      throw new Error('[Error] The parameter req should be the clientRequest type.');
    }
    if (!(ipRouter instanceof Router)) {
      throw new Error('[Error] The parameter ipPevents should be the router type.');
    }
    let ans = true;
    const prevent = ipRouter.gain(ip);
    if (prevent === undefined) {
      ipRouter.attach(ip, 1n);
      const { interval, } = this;
      setTimeout(() => {
        super.cleanTackle(ip);
      }, interval);
    } else {
      let count = prevent;
      count += 1n;
      ipRouter.revise(ip, count);
      const ifModifiedSince = req.headers['if-modified-since'];
      if (typeof ifModifiedSince === 'string') {
        const since = parseHttpDate(ifModifiedSince).getTime();
        if (typeof since !== 'number') {
          const now = new Date().getTime();
          if (since <= now) {
            ans = false;
          }
        }
      }
      const {
        threshold,
      } = this;
      if (count >= threshold) {
        ans = false;
      }
    }
    return ans;
  }

  inspect(ip, req) {
    if (typeof ip !== 'string') {
      throw new Error('[Error] The parameter ip should be of string type.');
    }
    if (req instanceof http.ClientRequest) {
      throw new Error('[Error] The parameter req should be the clientRequest type.');
    }
    if (net.isIPv4(ip)) {
      const { ipv4Router, } = this;
      return this.inspectStaticFile(ip, req, ipv4Router);
    } else if (net.isIPv6(ip)) {
      const { ipv6Router, } = this;
      return this.inspectStaticFile(ip, req, ipv6Router);
    } else {
      throw new Error('[Error] The Ip type is not expected.');
    }
  }
}

export default Prevents;
