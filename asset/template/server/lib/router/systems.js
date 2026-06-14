import http from 'http';
import path from 'path';
import fsPromises from 'fs/promises';
import global from '~/server/obj/global';

const { wr, or, } = global;

wr.attach('/get/system/main', async (req, res) => {
  if (or.gain('system.main.mtimeMs') === undefined) {
    const mainBundlePath = path.resolve('static', 'main.bundle.js');
    const stat = await fsPromises.stat(mainBundlePath);
    or.attach('system.main.mtimeMs', stat.mtimeMs);
  }
  const mtimeMs = or.gain('system.main.mtimeMs');
  res.end(JSON.stringify({ mtimeMs, }));
});

wr.attach('/get/system/test', async (req, res) => {
  res.end(JSON.stringify({ tip: 'Current is test mode.', }));
});
