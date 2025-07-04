import path from 'path';
import fs from 'fs';
import zlib from 'zlib';
import http2 from 'http2';
import {
  emphasis,
  tick,
  parseOptions,
} from 'mien';
import {
  Blocks,
  parseHttpDate,
  formatHttpKey,
  formatHttpDate,
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
  const ms = parseInt(fs.statSync(path.resolve('static', 'index.html')).mtimeMs);
  cacheOutput(req, res, '/index.html', data, ms);
}

function generateNotFoundJSON(req, res) {
  const { url, } = req;
  res.end(JSON.stringify({ status: -2, message: 'The current route ' + url + ' does not exist.', }));
}

function blockHttp(ip, res, blocks) {
  const count = blocks.getCount();
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
  const ip = req.socket.remoteAddress;
  try {
    const { method, } = req;
    switch (method) {
      case 'PUT':
      case 'DELETE':
        if (blocks1.examine(ip)) {
          res.end(JSON.stringify({
            status: -1,
            message: 'The static server currently does not support this method ' + method + '.',
          }));
        } else {
          blockHttp(ip, res, blocks1);
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
          const data = fs.readFileSync(filePath);
          const ms = parseInt(fs.statSync(filePath).mtimeMs);
          cacheOutput(req, res, restUrl, data, ms);
          return;
        } else {
          const { method, } = req;
          switch (method) {
            case 'GET':
              generateIndexHtml(req, res);
              return;
            default:
              if (blocks2.examine(ip)) {
                generateNotFoundJSON(req, res);
              } else {
                blockHttp(ip, res, blocks2);
              }
          }
          return;
        }
      }
    }
    if (url.substring(0, 4) === '/api') {
      const { length, } = url;
      const path = url.substring(4, length);
      let { content: aheadBlocks, }= aheadObstruct.gain(path);
      if (aheadBlocks === undefined) {
        const newAheadBlocks = new Blocks(7500);
        aheadObstruct.attach(path, newAheadBlocks);
        aheadBlocks = newAheadBlocks;
      }
      if (aheadBlocks.examine(ip) === false) {
        blockHttp(ip, res, aheadBlocks);
        return;
      }
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
          response = await onward.fetch(path, {
            method: 'POST',
            body,
          }, {
            ip,
          });
        } else {
          response = await onward.fetch(path, {
            method: 'POST',
          }, {
            ip,
          });
        }
        for (const k of response.headers.keys()) {
          res.statusCode = response.status;
          res[formatHttpKey(k)] = response.headers.get(k);
        }
        const data = await response.text();
        res.end(data);
      } else {
        generateNotFoundJSON(req, res);
      }
      return;
    }
    switch (method) {
      case 'POST': {
        let { content: ownBlocks }= ownObstruct.gain(url);
        if (ownBlocks === undefined) {
          const newOwnBlocks = new Blocks(7500);
          ownObstruct.attach(url, newOwnBlocks);
          ownBlocks = newOwnBlocks;
        }
        if (ownBlocks.examine(ip) === false) {
          blockHttp(ip, res, ownBlocks);
          return;
        }
        const { content: router, } = webRouter.gain(url);
        if (router !== undefined) {
          await router(req, res);
          return;
        } else {
          generateNotFoundJSON(req, res);
          return;
        }
        break;
      }
      case 'GET': {
        generateIndexHtml(req, res);
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
    http2.createServer({
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
