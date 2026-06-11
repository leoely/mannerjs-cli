import http from 'http';
import path from 'path';
import fsPromises from 'fs/promises';
import global from '~/server/obj/global';

const { wr, sys, } = global;

wr.attach('/get/system/main', async (req, res) => {
  if (sys.main === undefined) {
    sys.main = {};
  }
  const { main, } = sys;
  if (main.mtimeMs == undefined) {
    const mainBundlePath = path.resolve('static', 'main.bundle.js')
    main.mtimeMs = await fsPromises.stat(mainBundlePath).mtimeMs;
  }
  const { mtimeMs, } = main;
  res.end(JSON.stringify({ mtimeMs, }));
});
