import http from 'http';
import path from 'path';
import fs from 'fs';
import {
  discHndl,
} from 'manner.js/server'
import global from '~/server/obj/global';

const {
  webRouter,
} = global;

const mainBundlePath: string = path.resolve('static', 'main.bundle.js');
const modifyMs: number = fs.statSync(mainBundlePath).mtimeMs;

webRouter.attach('/update/message', async (req: http.ClientRequest, res: http.ServerResponse) => {
  let disc: boolean = false;
  req?.connection?.on('close', () => {
    disc = true;
  });
  await discHndl(disc, async () => {
    res.end(JSON.stringify({
      updateTime: modifyMs,
    }));
  });
});
