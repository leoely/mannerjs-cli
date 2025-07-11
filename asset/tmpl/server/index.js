import path from 'path';
import fs from 'fs';
import zlib from 'zlib';
import http from 'http';
import http2 from 'http2';
import {
  emphasis,
  tick,
  parseOptions,
} from 'mien';
import {
  Blocks,
  Prevents,
  parseHttpDate,
  formatHttpKey,
  formatHttpDate,
  disconnectHandle,
} from 'manner.js/server'
import global from '~/server/obj/global';
import '~/server/lib/forward/users';
import '~/server/lib/router/updates';

const [_, ...rest] = process.argv;
const options = parseOptions(...rest);

const {
  webRouter,
  forward,
  compress,
  file,
  modify,
  fulmination,
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
  res.end(JSON.stringify({ status: -2, message: 'The current route ' + url + ' does not exist.', }));
}

async function timeoutHandle(res, process) {
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

function preventStaticFile(res) {
  res.writeHead(304);
  res.end();
}

function blockRequest(ip, res, blocks) {
  const count = blocks.getCount(ip);
  if (count === 2) {
    res.writeHead(429);
    res.end(JSON.stringify({ ip, time: 7500, }));
  } else {
    res.end();
  }
}

const blocks1 = new Blocks(7500);
const blocks2 = new Blocks(7500);

async function processLogic(req, res, development) {
  try {
    let disconnect = false;
    req.connection.on('close', () => {
      disconnect = true;
    });
    const ip = req.socket.remoteAddress;
    const { method, } = req;
    switch (method) {
      case 'PUT':
      case 'DELETE':
        if (blocks1.examine(ip)) {
          await disconnectHandle(disconnect, () => {
            res.end(JSON.stringify({
              status: -1,
              message: 'The static server currently does not support this method ' + method + '.',
            }));
          });
        } else {
          await disconnectHandle(disconnect, () => {
            blockRequest(ip, res, blocks1);
          });
        }
        return;
    }
    const { url, } = req;
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
            preventStaticFile(res);
            return;
          }
          await disconnectHandle(disconnect, () => {
            const data = fs.readFileSync(filePath);
            const ms = fs.statSync(filePath).mtimeMs;
            cacheOutput(req, res, restUrl, data, ms);
          });
          return;
        } else {
            const { method, } = req;
            switch (method) {
              case 'GET':
                await disconnectHandle(disconnect, () => {
                  generateIndexHtml(req, res);
                });
              default:
                if (blocks2.examine(ip)) {
                  await disconnectHandle(disconnect, () => {
                    generateNotFoundJSON(req, res);
                  });
                } else {
                  await disconnectHandle(disconnect, () => {
                    blockRequest(ip, res, blocks2);
                  });
                }
            }
          return;
        }
      }
    }
    if (url.substring(0, 4) === '/api') {
      await disconnectHandle(disconnect, async () => {
        const { length, } = url;
        const path = url.substring(4, length);
        let { content: aheadBlocks, }= aheadObstruct.gain(path);
        if (aheadBlocks === undefined) {
          const newAheadBlocks = new Blocks(7500);
          aheadObstruct.attach(path, newAheadBlocks);
          aheadBlocks = newAheadBlocks;
        }
        if (aheadBlocks.examine(ip) === false) {
          blockRequest(ip, res, aheadBlocks);
          return;
        }
        await disconnectHandle(disconnect, async () => {
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
                const result = await timeoutHandle(res, async () => {
                  response = await onward.fetch(path, {
                    method: 'POST',
                    signal: AbortSignal.timeout(8000),
                    body,
                  });
                });
                if (result === false) {
                  return;
                }
              }
            } else {
              if (req.headers['has-timeout'] === 'false') {
                response = await onward.fetch(path, {
                  method: 'POST',
                });
              } else {
                const result = await timeoutHandle(res, async () => {
                  response = await onward.fetch(path, {
                    method: 'POST',
                    signal: AbortSignal.timeout(8000),
                  });
                });
                if (result === false) {
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
            }
          } else {
            generateNotFoundJSON(req, res);
          }
        });
      });
      return;
    }
    switch (method) {
      case 'POST': {
        await disconnectHandle(disconnect, async () => {
          let { content: ownBlocks }= ownObstruct.gain(url);
          if (ownBlocks === undefined) {
            const newOwnBlocks = new Blocks(7500);
            ownObstruct.attach(url, newOwnBlocks);
            ownBlocks = newOwnBlocks;
          }
          if (ownBlocks.examine(ip) === false) {
            blockRequest(ip, res, ownBlocks);
            return;
          }
          await disconnectHandle(disconnect, async () => {
            const { content: router, } = webRouter.gain(url);
            if (router !== undefined) {
              await router(req, res);
            } else {
              generateNotFoundJSON(req, res);
            }
          });
        });
        return;
      }
      case 'GET': {
        disconnectHandle(disconnect, () => {
          generateIndexHtml(req, res);
        });
        return;
      }
      default:
    }
  } catch (error) {
    switch (development) {
      case 'true':
        throw error;
        break;
      case 'false':
        res.writeHead(500);
        res.end();
        break;
      default:
        throw new Error('[Error] Parameter development should be character boolean type');
    }
  }
}

const port = options.p || options.port;
const development = options.d || options.development;
const safe = options.s || options.safe || 'false';

switch (safe) {
  case 'true':
    http2.createSecureServer({
      key: fs.readFileSync('asset/temporary-key.pem'),
      cert: fs.readFileSync('asset/temporary-cert.pem'),
    }, async (req, res) => {
      await processLogic(req, res, development);
    }).listen(port);
    break;
  default:
    http.createServer({
    }, async (req, res) => {
      await processLogic(req, res, development);
    }).listen(port);
}

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
`);
