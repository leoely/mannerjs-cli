import os from 'os';
import path from 'path';
import fs from 'fs';
import zlib from 'zlib';
import http from 'http';
import http2 from 'http2';
import Fulmination from 'fulmination';
import {
  emphasis,
  tick,
  isIntOpt,
  isBoolOpt,
  parseOptions,
} from 'mien';
import {
  Blocks,
  Prevents,
  checkLogPath,
  addToLog,
  appendToLog,
  logOutOfMemory,
  parseHttpDate,
  formatHttpKey,
  formatHttpDate,
} from 'manner.js/server'
import global from '~/server/obj/global';

const fr1Key = Symbol.for('fr1');
const fr2Key = Symbol.for('fr2');
const fr3Key = Symbol.for('fr3');
const fr4Key = Symbol.for('fr4');
const wr1Key = Symbol.for('wr1');
const wr2Key = Symbol.for('wr2');

const {
  or,
  wr,
  fwd,
  [fr1Key]: fr1,
  [fr2Key]: fr2,
  [fr3Key]: fr3,
  [fr4Key]: fr4,
  [wr1Key]: wr1,
  [wr2Key]: wr2,
} = global;

function dealCompress(data, address, res) {
  let mini = fr3.gain(address);
  if (mini === undefined) {
    fr3.attach(address, data);
    mini = data;
  }
  res.end(mini);
}

function compressOutput(req, res, data, url) {
  res.setHeader('Vary', 'Accept-Encoding');
  let acceptEncoding = req.headers['accept-encoding'] || '';
  if (/\bdeflate\b/.test(acceptEncoding)) {
    res.writeHead(200, { 'Content-Encoding': 'deflate' });
    dealCompress(zlib.deflateSync(data), url, res);
  } else if (/\bgzip\b/.test(acceptEncoding)) {
    res.writeHead(200, { 'Content-Encoding': 'gzip' });
    dealCompress(zlib.gzipSync(data), url, res);
  } else if (/\bbr\b/.test(acceptEncoding)) {
    res.writeHead(200, { 'Content-Encoding': 'br' });
    dealCompress(zlib.brotliCompressSync(data), url, res);
  } else if (/\bzstd\b/.test(acceptEncoding)) {
    res.writeHead(200, { 'Content-Encoding': 'zstd' });
    dealCompress(zlib.zstdCompressSync(data), url, res);
  } else {
    res.writeHead(200, {});
    let raw = fr2.gain(url);
    if (raw === undefined) {
      fr2.attach(url, data);
      raw = fr2.gain(url);
    }
    res.end(raw);
  }
}

function dealFile(address, data) {
  let raw = fr2.gain(address);
  if (raw === undefined) {
    fr2.attach(address, data);
    raw = data;
  }
  return raw;
}

function dealModify(fr, address, ms) {
  let change = fr.gain(address);
  if (change  === undefined) {
    const time = new Date(ms).getTime();
    fr.attach(address, time);
    change = time;
  }
  return change;
}

function cacheOutput(req, res, url, data, ms) {
  let ifModifiedSince = req.headers['if-modified-since'];
  if (ifModifiedSince === undefined) {
    const raw = dealFile(url, data);
    const change = dealModify(fr1, url, ms);
    res.setHeader('Last-Modified', formatHttpDate(change));
    compressOutput(req, res, raw, url);
  } else {
    const change = dealModify(fr1, url, ms);
    const raw = dealFile(url, data);
    const since = parseHttpDate(ifModifiedSince).getTime();
    if (since < change) {
      const raw = dealFile(url, data);
      res.setHeader('Last-Modified', formatHttpDate(change));
      compressOutput(req, res, raw, url);
    } else {
      res.writeHead(304);
      res.end();
    }
  }
}

function returnIndexHtml(req, res) {
  const data = fs.readFileSync(path.resolve('static', 'index.html'));
  const ms = fs.statSync(path.resolve('static', 'index.html')).mtimeMs;
  cacheOutput(req, res, '/index.html', data, ms);
}

function returnNotFoundJSON(req, res) {
  const { url, } = req;
  res.end(JSON.stringify({
    status: -2, message: 'The current route ' + url + ' does not exist.',
  }));
}

async function treatTimeout(res, method) {
  let ans = true;
  try {
    await method();
  } catch (error) {
    const { name, } = error;
    switch (name) {
      case 'AbortError':
        res.writeHead(512);
        res.end('');
        ans = false;
        break;
      default:
        throw new Error('[Error] Unexpected exception occurred.');
    }
  }
  return ans;
}
function deterObtainFile(res) {
  res.writeHead(304);
  res.end();
}

function stemRequest(ip, res, blks) {
  const count = blks.getCount(ip);
  switch (count) {
    case 2:
      res.writeHead(429);
      res.end(JSON.stringify({ ip, time: 7500, }));
      break;
    default:
      res.end();
  }
}

const handleKey = Symbol('handle');
const dealCmdOptionsKey = Symbol('dealCmdOptions');
const dealOptionsKey = Symbol('dealOptions');
const outputErrorKey = Symbol('outputError');
const outputSituationKey = Symbol('outputSituation');
const checkMemoryKey = Symbol('checkMemory');
const addToLogKey = Symbol('addToLog');
const appendToLogKey = Symbol('appendToLog');
const handleBurdenKey = Symbol('handleBurden');

class HttpHandle {
  constructor(options) {
    const [_, ...rest] = process.argv;
    const cmdOptions = parseOptions(...rest);
    this[dealCmdOptionsKey](cmdOptions);
    const defaultOptions = {
      debug: false,
      logLevel: 0,
      logPath: '/var/log/manner.js/',
      onlyLogFail: true,
      burdenTimeout: 8000,
      abortTimeout: 8000,
      methodNotSupport: { interval: 7500, },
      interfaceDontExist: { interval: 7500, },
      normalSituation: { interval: 7500, },
      forwardSituation: { interval: 7500, },
      staticFileSituation: {
        count: 3,
        interval: 20000,
      },
    }
    this.options = Object.assign(defaultOptions, options);
    this[dealOptionsKey]();
    const {
      options: {
        logPath,
        debug,
      },
    } = this;
    checkLogPath(logPath);
    if (debug === true) {
      this.fulmination = new Fulmination();
    }
    const {
      options: {
        methodNotSupport,
        interfaceDontExist,
      },
    } = this;
    this.blks1 = new Blocks(methodNotSupport.interval);
    this.blks2 = new Blocks(interfaceDontExist.interval);
    this[checkMemoryKey]();
  }

  [dealCmdOptionsKey](options) {
    const port = options.p || options.port;
    if (!isIntOpt(port)) {
      throw new Error('[Error] Option port should be of integer type.');
    }
    this.port = port;
    const development = options.d || options.development;
    if (!isBoolOpt(development)) {
      throw new Error('[Error] Option development should be of type boolean.');
    }
    this.development = development;
    const safe = options.s || options.safe;
    if (!isBoolOpt(safe)) {
      throw new Error('[Error] Option safe should be of type boolean.');
    }
    this.safe = safe;
    const condition = options.c || options.condition || '0';
    if (!isIntOpt(condition)) {
      throw new Error('[Error] Option condition should be of integer type.');
    }
    this.condition = condition;
  }

  [dealOptionsKey]() {
    const {
      options: {
        debug,
        logLevel,
        logPath,
        onlyLogFail,
        abortTimeout,
      },
    } = this;
    if (typeof debug !== 'boolean') {
      throw new Error('[Error] The option debug should be of boolean type.');
    }
    if (!Number.isInteger(logLevel)) {
      throw new Error('[Error] The option logLevel should be of integer type.');
    }
    if (!(logLevel >= 0)) {
      throw new Error('[Error] The option logLevel should be greater than and equal to zero.');
    }
    if (typeof logPath !== 'string') {
      throw new Error('[Error] The option logPath should be of string type.');
    }
    if (typeof onlyLogFail !== 'boolean') {
      throw new Error('[Error] Option onlyLogFail should be of type boolean.');
    }
    if (!Number.isInteger(abortTimeout)) {
      throw new Error('[Error] The option abortTimeout should be of integer type.');
    }
    if (!(abortTimeout > 0)) {
      throw new Error('[Error] The option abortTimeout should be a positive integer.');
    }
  }

  [outputErrorKey](error) {
    if (!(error instanceof Error)) {
      throw new Error('Parameter error should be of error type.');
    }
    const {
      options: {
        debug,
      },
    } = this;
    if (debug === true) {
      const {
        fulmination,
      } = this;
      const content = Fulmination.processOriginalContent(error.stack);
      fulmination.scan(`<+> dim: ${content}`);
    }
    const {
      options: {
        logPath,
      },
    } = this;
    if (typeof logPath === 'string') {
      this[addToLogKey](error.stack);
    }
  }

  [outputSituationKey](situation, ip, url, method) {
    if (typeof situation !== 'string') {
      throw new Error('[Error] The parameter situation should be of string type.');
    }
    if (typeof ip !== 'string') {
      throw new Error('[Error] The parameter ip should be of string type.');
    }
    if (typeof url !== 'string') {
      throw new Error('[Error] The parameter url should be of string type.');
    }
    if (typeof method !== 'string') {
      throw new Error('[Error] The parameter method should be of string type.');
    }
    const {
      options: {
        debug,
      },
    } = this;
    let type;
    switch (situation) {
      case 'obtain static resource':
      case 'forward':
      case 'processing':
        type = 1;
        break;
      case 'method not supported':
      case 'block request':
      case 'prevent obtain':
      case 'timeout':
      case 'interface does not exist':
      case 'server internal error':
        type = 0;
        break;
      default:
        throw new Error('[Error] Encountering unexpected situations.');
    }
    if (debug === true) {
      const {
        fulmination,
      } = this;
      switch (type) {
        case 0:
          fulmination.scan('(+) bold: !! Status": (+) dim: "[FAIL"] * (+) bold: @@ Url": (+) dim: "[' + url + '"] * (+) bold: ++ Ip": (+) dim: "["b' + ip + '""] * (+) bold: ^^ Situation": (+) dim:"[' + situation + '"] * (+) bold: "&"& Method": (+) dim: "[' + method + '"] &');
          break;
        case 1:
          fulmination.scan('(+) bold: "*"* Status": (+) dim: "[SUCCESS"] * (+) bold: @@ Url": (+) dim: "[' + url + '"] * (+) bold: ++ Ip": (+) dim: "["b' + ip + '""] * (+) bold: ^^ Situation": (+) dim:"[' + situation + '"] * (+) bold: "&"& Method": (+) dim: "[' + method + '"] &');
          break;
        default:
          throw new Error('[Error] The value of the type does not match the expected value.');
      }
    }
    const {
      options: {
        logPath,
        onlyLogFail,
      },
    } = this;
    if (typeof logPath === 'string') {
      const {
        options: {
          logLevel,
        },
      } = this;
      if (onlyLogFail === true) {
        if (type === 1) {
          return;
        }
      }
      switch (logLevel) {
        case 0:
          break;
        case 1:
          this[appendToLogKey]('Situation:' + situation + ' ████ & ████ Ip:' + ip);
          break;
        case 2:
          this[appendToLogKey]('Situation:' + situation + ' ████ & ████ Url:' + url);
          break;
        case 3:
          this[appendToLogKey]('Situation:' + situation + ' ████ & ████ Method:' + method);
          break;
        case 4:
          this[appendToLogKey]('Situation:' + situation + ' ████ & ████ Ip:' + ip + '████ & ████ Url:' + url);
          break;
        case 5:
          this[appendToLogKey]('Situation:' + situation + ' ████ & ████ Ip:' + ip + '████ & ████ Method:' + method);
          break;
        case 6:
          this[appendToLogKey]('Situation:' + situation + ' ████ & ████ Url:' + url + '████ & ████ Method:' + method);
          break;
        case 7:
          this[appendToLogKey]('Situation:' + situation + ' ████ & ████ Url:' + url + '████ & ████ Url:' + url + '████ & ████ Method:' + method + '████ & ████ Ip:' + ip);
          break;
        default:
          throw new Error('[Error] The log should be in the interval [0, 7].');
      }
    }
  }

  [checkMemoryKey]() {
    const freemem = os.freemem();
    if (freemem <= 0) {
      const {
        options: {
          logPath,
        },
      } = this;
      if (typeof logPath === 'string') {
        logOutOfMemory(logPath, freemem);
      }
    }
  }

  async [handleBurdenKey](res, method) {
    let ans = true;
    const {
      options: {
        burdenTimeout: timeout,
      },
    } = this;
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('[Error] Local processing overload timeout.'));
      }, timeout);
    });
    try {
      await Promise.race([method(), timeoutPromise]);
    } catch (error) {
      if (error.message === '[Error] Local processing overload timeout.') {
        res.writeHead(512);
        res.end('');
        ans = false;
      } else {
        throw errror;
      }
    }
    return ans;
  }

  [appendToLogKey](content) {
    if (typeof content !== 'string') {
      throw new Error('[Error] The parameter content must be of string type.');
    }
    const {
      options: {
        logPath,
      },
    } = this;
    appendToLog(logPath, ' || ████ ' + content + ' ████ ||\n');
  }

  [addToLogKey](content) {
    if (typeof content !== 'string') {
      throw new Error('[Error] The parameter content must be of string type.');
    }
    const {
      options: {
        logPath,
      },
    } = this;
    addToLog(logPath, content);
  }

  async [handleKey](req, res) {
    const {
      method,
      url,
      socket: {
        remoteAddress: ip,
      },
    } = req;
    try {
      const { condition, } = this;
      switch (condition) {
        case '1':
          or.attach('system.test.error', true);
          break;
        case '2':
          or.attach('system.test.busy', true);
          break;
      }
      switch (method) {
        case 'PUT':
        case 'DELETE': {
          const { blks1, } = this;
          if (blks1.examine(ip)) {
            res.end(JSON.stringify({
              status: -1,
              message: 'The static server currently does not support this method ' + method + '.',
            }));
            this[outputSituationKey]('method not supported', ip, url, method);
          } else {
            stemRequest(ip, res, blks1);
            this[outputSituationKey]('block request', ip, url, method);
          }
          return;
        }
      }
      const extname = path.extname(url);
      switch (extname) {
        case '.js':
        case '.ico':
        case '.avif':
        case '.gif':
        case '.jpg':
        case '.jpeg':
        case '.jfif':
        case '.pjpeg':
        case '.pjp':
        case '.png':
        case '.eot':
        case '.woff2':
        case '.woff':
        case '.ttf':
        case '.svg': {
          const restUrl = path.basename(url);
          const filePath = path.resolve('static', restUrl);
          if (fs.existsSync(filePath)) {
            let prevn1 = fr4.gain(filePath);
            if (prevn1 === undefined) {
              const {
                options: {
                  staticFileSituation: {
                    count,
                    interval,
                  },
                },
              } = this;
              const prevn2 = new Prevents(count, interval);
              fr4.attach(filePath, prevn2);
              prevn1 = prevn2;
            }
            if (prevn1.inspect(ip, req) === false) {
              deterObtainFile(res);
              this[outputSituationKey]('prevent obtain', ip, url, method);
              return;
            }
            const data = fs.readFileSync(filePath);
            const ms = fs.statSync(filePath).mtimeMs;
            cacheOutput(req, res, restUrl, data, ms);
            this[outputSituationKey]('obtain static resource', ip, url, method);
            return;
          } else {
              switch (method) {
                case 'GET':
                  returnIndexHtml(req, res);
                  this[outputSituationKey]('obtain static resource', ip, url, method);
                default: {
                  const { blks2, } = this;
                  if (blks2.examine(ip)) {
                    returnNotFoundJSON(req, res);
                    this[outputSituationKey]('interface does not exist', ip, url, method);
                  } else {
                    stemRequest(ip, res, blks2);
                    this[outputSituationKey]('block request', ip, url, method);
                  }
                }
              }
            return;
          }
        }
      }
      if (url.substring(0, 4) === '/api') {
        const { length, } = url;
        const path = url.substring(4, length);
        let { content: blks1, }= wr1.gain(path);
        if (blks1 === undefined) {
          const {
            options: {
              forwardSituation: {
                interval,
              },
            }
          } = this;
          const blks2 = new Blocks(interval);
          wr1.attach(path, blks2);
          blks1 = blks2;
        }
        if (blks1.examine(ip) === false) {
          stemRequest(ip, res, blks1);
          this[outputSituationKey]('block request', ip, url, method);
          return;
        }
        const { content: onward, } = await fwd.gain(path);
        if (onward !== undefined) {
          const body = await new Promise((resolve, reject) => {
            req.on('data', (data) => {
              resolve(data.toString());
            });
            req.on('end', () => {
              resolve('');
            });
          });
          let response;
          if (body !== '') {
            if (req.headers['has-timeout'] === 'false') {
              response = await onward.fetch(path, {
                method: 'POST',
                body,
              });
            } else {
              const {
                options: {
                  abortTimeout,
                },
              } = this;
              const result = await treatTimeout(res, async () => {
                response = await onward.fetch(path, {
                  method: 'POST',
                  signal: AbortSignal.timeout(abortTimeout),
                  body,
                });
              });
              if (result === false) {
                this[outputSituationKey]('timeout', ip, url, method);
                return;
              }
            }
          } else {
            if (req.headers['has-timeout'] === 'false') {
              response = await onward.fetch(path, {
                method: 'POST',
              });
            } else {
              const {
                options: {
                  abortTimeout,
                },
              } = this;
              const result = await treatTimeout(res, async () => {
                response = await onward.fetch(path, {
                  method: 'POST',
                  signal: AbortSignal.timeout(abortTimeout),
                });
              });
              if (result === false) {
                this[outputSituationKey]('timeout', ip, url, method);
                return;
              }
            }
          }
          if (response !== undefined) {
            for (const k of response.headers.keys()) {
              res.statusCode = response.status;
              res[formatHttpKey(k)] = response.headers.get(k);
            }
            const data = await response.text();
            res.end(data);
            this[outputSituationKey]('forward', ip, url, method);
          }
        } else {
          returnNotFoundJSON(req, res);
          this[outputSituationKey]('interface does not exist', ip, url, method);
        }
        return;
      }
      switch (method) {
        case 'POST': {
          let { content: blks1 } = wr2.gain(url);
          if (blks1 === undefined) {
            const {
              options: {
                normalSituation: {
                  interval,
                },
              },
            } = this;
            const blks2 = new Blocks(interval);
            wr2.attach(url, blks2);
            blks1 = blks2;
          }
          if (blks1.examine(ip) === false) {
            stemRequest(ip, res, blks1);
            this[outputSituationKey]('block request', ip, url, method);
            return;
          }
          const { content: router, } = wr.gain(url);
          if (router !== undefined) {
            const result = await this[handleBurdenKey](res, async () => {
              await router(req, res);
            });
            if (result === true) {
              this[outputSituationKey]('processing', ip, url, method);
            } else {
              this[outputSituationKey]('timeout', ip, url, method);
            }
          } else {
            returnNotFoundJSON(req, res);
            this[outputSituationKey]('interface does not exist', ip, url, method);
          }
          return;
        }
        case 'GET':
          returnIndexHtml(req, res);
          this[outputSituationKey]('obtain static resource', ip, url, method);
          return;
      }
    } catch (error) {
      const { development, } = this;
      switch (development) {
        case 'true':
          throw error;
          break;
        case 'false':
          res.writeHead(500);
          res.end();
          this[outputSituationKey]('server internal error', ip, url, method);
          this[outputErrorKey](error);
          break;
        default:
          throw new Error('[Error] Parameter development should be character boolean type');
      }
    }
    this[checkMemoryKey]();
  }

  listen() {
    const { port, safe, development, condition, } = this
    switch (safe) {
      case 'true':
        http2.createSecureServer({
          key: fs.readFileSync('asset/test-key.pem'),
          cert: fs.readFileSync('asset/test-cert.pem'),
        }, async (req, res) => {
          await this[handleKey](req, res);
        }).listen(port);
        break;
      default:
        http.createServer({
        }, async (req, res) => {
          await this[handleKey](req, res);
        }).listen(port);
    }
    const {
      options: {
        debug,
      },
    } = this;
    if (debug === true) {
      const {
        fulmination,
      } = this;
      const currentPath = path.resolve('.');
      const packageJSON = fs.readFileSync(path.join(currentPath, 'package.json')).toString();
      const { name, } = JSON.parse(packageJSON);
      fulmination.scan(`
        [+]:
        |
        | ███╗░░░███╗░█████╗░███╗░░██╗███╗░░██╗███████╗██████╗░░░░░░░░░██╗░██████╗
        | ████╗░████║██╔══██╗████╗░██║████╗░██║██╔════╝██╔══██╗░░░░░░░░██║██╔════╝
        | ██╔████╔██║███████║██╔██╗██║██╔██╗██║█████╗░░██████╔╝░░░░░░░░██║╚█████╗░
        | ██║╚██╔╝██║██╔══██║██║╚████║██║╚████║██╔══╝░░██╔══██╗░░░██╗░░██║░╚═══██╗
        | ██║░╚═╝░██║██║░░██║██║░╚███║██║░╚███║███████╗██║░░██║██╗╚█████╔╝██████╔╝
        | ╚═╝░░░░░╚═╝╚═╝░░╚═╝╚═╝░░╚══╝╚═╝░░╚══╝╚══════╝╚═╝░░╚═╝╚═╝░╚════╝░╚═════╝░
        |
        ` + tick() + `(+) bold: The project ` + emphasis(name) + `(+) bold: * was successfully started on port ` + emphasis(port) + `(+) bold: . &
        ` + tick() + `(+) bold: Project ` + emphasis('development mode') + `(+) bold: * is` + emphasis(development) + `(+) bold: . &
        ` + tick() + `(+) bold: Project ` + emphasis('safe mode') + `(+) bold: * is` + emphasis(safe) + `(+) bold: . &
        ` + tick() + `(+) bold: Project ` + emphasis('condition') + `(+) bold: * is` + emphasis(condition) + `(+) bold: . 2&
      `);
    }
    this[checkMemoryKey]();
  }
}

export default HttpHandle;
