import http from 'http';
import path from 'path';
import fs from 'fs';
import {
  disconnectHandle,
} from 'manner.js/server'
import global from '~/server/obj/global';

const {
  webRouter,
} = global;

const filePath: string = path.resolve('static', 'main.bundle.js');
const mtime: number = fs.statSync(filePath).mtimeMs;

webRouter.attach('/update/message', async (req: http.ClientRequest, res: http.ServerResponse) => {
  let disconnect: boolean = false;
  req?.connection?.on('close', () => {
    disconnect = true;
  });
  await disconnectHandle(disconnect, async () => {
    res.end(JSON.stringify({ startUpTime: mtime, }));
  });
});
