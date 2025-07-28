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
  cross,
  isIntOpt,
  isBoolOpt,
  parseOptions,
} from 'mien';
import {
  Blocks,
  Prevents,
  discHndl,
  checkLogPath,
  appendToLog,
  logOutOfMemory,
  parseHttpDate,
  formatHttpKey,
  formatHttpDate,
} from 'manner.js/server'
import global from '~/server/obj/global';

const {
  webRouter,
  forward,
  compress,
  file,
  modify,
  ownObstruct,
  aheadObstruct,
  staticStop,
} = global;

function dealCompress(data, address, res) {
  let mini = compress.gain(address);
  if (mini === undefined) {
    compress.attach(address, data);
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
    let raw = file.gain(url);
    if (raw === undefined) {
      file.attach(url, data);
      raw = file.gain(url);
    }
    res.end(raw);
  }
}

function dealFile(file, address, data) {
  let raw = file.gain(address);
  if (raw === undefined) {
    file.attach(address, data);
    raw = data;
  }
  return raw;
}

function dealModify(modify, address, ms) {
  let change = modify.gain(address);
  if (change  === undefined) {
    const time = new Date(ms).getTime();
    modify.attach(address, time);
    change = time;
  }
  return change;
}

function cacheOutput(req, res, url, data, ms) {
  let ifModifiedSince = req.headers['if-modified-since'];
  if (ifModifiedSince === undefined) {
    const raw = dealFile(file, url, data);
    const change = dealModify(modify, url, ms);
    res.setHeader('Last-Modified', formatHttpDate(change));
    compressOutput(req, res, raw, url);
  } else {
    const change = dealModify(modify, url, ms);
    const raw = dealFile(file, url, data);
    const since = parseHttpDate(ifModifiedSince).getTime();
    if (since < change) {
      const raw = dealFile(file, url, data);
      res.setHeader('Last-Modified', formatHttpDate(change));
      compressOutput(req, res, raw, url);
    } else {
      res.writeHead(304);
      res.end();
    }
  }
}

function generateIndexHtml(req, res) {
  const data = fs.readFileSync(path.resolve('static', 'index.html'));
  const ms = fs.statSync(path.resolve('static', 'index.html')).mtimeMs;
  cacheOutput(req, res, '/index.html', data, ms);
}

function generateNotFoundJSON(req, res) {
  const { url, } = req;
  res.end(JSON.stringify({
    status: -2, message: 'The current route ' + url + ' does not exist.',
  }));
}

async function tmoHndl(res, process) {
  let ans = true;
  try {
    await process();
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

function pvntObt(res) {
  res.writeHead(304);
  res.end();
}

function blkReq(ip, res, blocks) {
  const count = blocks.getCount(ip);
  if (count === 2) {
    res.writeHead(429);
    res.end(JSON.stringify({ ip, time: 7500, }));
  } else {
    res.end();
  }
}

class HttpHandle {
  constructor(options) {
    const [_, ...rest] = process.argv;
    const cmdOptions = parseOptions(...rest);
    this.dealCmdOptions(cmdOptions);
    const defaultOptions = {
      debug: false,
      logLevel: 0,
      logPath: '/var/log/manner.js/'
    };
    this.options = Object.assign(defaultOptions, options);
    this.dealOptions();
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
    this.blocks1 = new Blocks(7500);
    this.blocks2 = new Blocks(7500);
    this.checkMemory();
  }

  dealCmdOptions(options) {
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
  }

  dealOptions() {
    const {
      options: {
        debug,
        logLevel,
        logPath,
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
  }

  outputSituation(situation, ip, url, method) {
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
    if (debug === true) {
      const {
        fulmination,
      } = this;
      switch (situation) {
        case 'obtain static resource':
        case 'foward':
        case 'processing':
          fulmination.scan('(+) bold: "*"* Status"; (+) dim: "[SUCCESS"] * (+) bold: @@ Url": (+) dim: "[' + url + '"] * (+) bold: ++ Ip": (+) dim: "[' + ip + '"] * (+) bold: ^^ Situation": (+) dim:"[' + situation + '"] * (+) bold: "&"& Method": (+) dim: "[' + method + '"] &');
          break;
        case 'method not supported':
        case 'block request':
        case 'prevent obtain':
        case 'timeout':
        case 'interface does not exist':
        case 'server internal error':
          fulmination.scan('(+) bold: !! Status"; (+) dim: "[FAIL"] * (+) bold: @@ Url": (+) dim: "[' + url + '"] * (+) bold: ++ Ip": (+) dim: "[' + ip + '"] * (+) bold: ^^ Situation": (+) dim:"[' + situation + '"] * (+) bold: "&"& Method": (+) dim: "[' + method + '"] &');
          break;
        default:
          throw new Error('[Error] Encountering unexpected situations.');
      }
    }
    const {
      options: {
        logPath,
      },
    } = this;
    if (typeof logPath === 'string') {
      const {
        options: {
          logLevel,
        },
      } = this;
      switch (logLevel) {
        case 0:
          break;
        case 1:
          this.appendToLog('Situation:' + situation + ' ████ & ████ Ip:' + ip);
          break;
        case 2:
          this.appendToLog('Situation:' + situation + ' ████ & ████ Url:' + url);
          break;
        case 3:
          this.appendToLog('Situation:' + situation + ' ████ & ████ Method:' + method);
          break;
        case 4:
          this.appendToLog('Situation:' + situation + ' ████ & ████ Ip:' + ip + '████ & ████ Url:' + url);
          break;
        case 5:
          this.appendToLog('Situation:' + situation + ' ████ & ████ Ip:' + ip + '████ & ████ Method:' + method);
          break;
        case 6:
          this.appendToLog('Situation:' + situation + ' ████ & ████ Url:' + url + '████ & ████ Method:' + method);
          break;
        case 7:
          this.appendToLog('Situation:' + situation + ' ████ & ████ Url:' + url + '████ & ████ Url:' + url + '████ & ████ Method:' + method);
          break;
        default:
          throw new Error('[Error] The log should be in the interval [0, 7].');
      }
    }
  }

  checkMemory() {
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

  appendToLog(content) {
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

  async handle(req, res) {
    try {
      let disc = false;
      req.connection.on('close', () => {
        disc = true;
      });
      const {
        method,
        url,
        socket: {
          remoteAddress: ip,
        },
      } = req;
      switch (method) {
        case 'PUT':
        case 'DELETE': {
          const { blocks1, } = this;
          if (blocks1.examine(ip)) {
            await discHndl(disc, () => {
              res.end(JSON.stringify({
                status: -1,
                message: 'The static server currently does not support this method ' + method + '.',
              }));
              this.outputSituation('method not supported', ip, url, method);
            });
          } else {
            await discHndl(disc, () => {
              blkReq(ip, res, blocks1);
              this.outputSituation('block request', ip, url, method);
            });
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
            let prevents = staticStop.gain(filePath);
            if (prevents === undefined) {
              const newPrevents = new Prevents(3, 20000);
              staticStop.attach(filePath, newPrevents);
              prevents = newPrevents;
            }
            if (prevents.inspect(ip, req) === false) {
              pvntObt(res);
              this.outputSituation('prevent obtain', ip, url, method);
              return;
            }
            await discHndl(disc, () => {
              const data = fs.readFileSync(filePath);
              const ms = fs.statSync(filePath).mtimeMs;
              cacheOutput(req, res, restUrl, data, ms);
              this.outputSituation('obtain static resource', ip, url, method);
            });
            return;
          } else {
              switch (method) {
                case 'GET':
                  await discHndl(disc, () => {
                    generateIndexHtml(req, res);
                    this.outputSituation('obtain static resource', ip, url, method);
                  });
                default: {
                  const { blocks2, } = this;
                  if (blocks2.examine(ip)) {
                    await discHndl(disc, () => {
                      generateNotFoundJSON(req, res);
                      this.outputSituation('interface does not exist', ip, url, method);
                    });
                  } else {
                    await discHndl(disc, () => {
                      blkReq(ip, res, blocks2);
                      this.outputSituation('block request', ip, url, method);
                    });
                  }
                }
              }
            return;
          }
        }
      }
      if (url.substring(0, 4) === '/api') {
        await discHndl(disc, async () => {
          const { length, } = url;
          const path = url.substring(4, length);
          let { content: aheadBlocks, }= aheadObstruct.gain(path);
          if (aheadBlocks === undefined) {
            const newAheadBlocks = new Blocks(7500);
            aheadObstruct.attach(path, newAheadBlocks);
            aheadBlocks = newAheadBlocks;
          }
          if (aheadBlocks.examine(ip) === false) {
            blkReq(ip, res, aheadBlocks);
            this.outputSituation('block request', ip, url, method);
            return;
          }
          await discHndl(disc, async () => {
            const { content: onward, } = await forward.gain(path);
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
                  const result = await tmoHndl(res, async () => {
                    response = await onward.fetch(path, {
                      method: 'POST',
                      signal: AbortSignal.timeout(8000),
                      body,
                    });
                  });
                  if (result === false) {
                    this.outputSituation('timeout', ip, url, method);
                    return;
                  }
                }
              } else {
                if (req.headers['has-timeout'] === 'false') {
                  response = await onward.fetch(path, {
                    method: 'POST',
                  });
                } else {
                  const result = await tmoHndl(res, async () => {
                    response = await onward.fetch(path, {
                      method: 'POST',
                      signal: AbortSignal.timeout(8000),
                    });
                  });
                  if (result === false) {
                    this.outputSituation('timeout', ip, url, method);
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
                this.outputSituation('forward', ip, url, method);
              }
            } else {
              generateNotFoundJSON(req, res);
              this.outputSituation('interface does not exist', ip, url, method);
            }
          });
        });
        return;
      }
      switch (method) {
        case 'POST': {
          await discHndl(disc, async () => {
            let { content: ownBlocks }= ownObstruct.gain(url);
            if (ownBlocks === undefined) {
              const newOwnBlocks = new Blocks(7500);
              ownObstruct.attach(url, newOwnBlocks);
              ownBlocks = newOwnBlocks;
            }
            if (ownBlocks.examine(ip) === false) {
              blkReq(ip, res, ownBlocks);
              this.outputSituation('block request', ip, url, method);
              return;
            }
            await discHndl(disc, async () => {
              const { content: router, } = webRouter.gain(url);
              if (router !== undefined) {
                await router(req, res);
                this.outputSituation('processing', ip, url, method);
              } else {
                generateNotFoundJSON(req, res);
                this.outputSituation('interface does not exist', ip, url, method);
              }
            });
          });
          return;
        }
        case 'GET': {
          discHndl(disc, () => {
            generateIndexHtml(req, res);
            this.outputSituation('obtain static resource', ip, url, method);
          });
          return;
        }
        default:
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
          this.outputSituation('server internal error', ip, url);
          break;
        default:
          throw new Error('[Error] Parameter development should be character boolean type');
      }
    }
    this.checkMemory();
  }

  listen() {
    const { port, safe, development, } = this
    switch (safe) {
      case 'true':
        http2.createSecureServer({
          key: fs.readFileSync('asset/temporary-key.pem'),
          cert: fs.readFileSync('asset/temporary-cert.pem'),
        }, async (req, res) => {
          await this.handle(req, res);
        }).listen(port);
        break;
      default:
        http.createServer({
        }, async (req, res) => {
          await this.handle(req, res);
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
        ` + tick() + `(+) bold: Project ` + emphasis('safe mode') + `(+) bold: * is` + emphasis(safe) + `(+) bold: . 2&
      `);
    }
    this.checkMemory();
  }
}

export default HttpHandle;
