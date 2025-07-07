import http from 'http';
import global from '~/server/obj/global';

const {
  webRouter,
} = global;

const time: number = new Date().getTime();

webRouter.attach('/update/message', async (req: http.ClientRequest, res: http.ServerResponse) => {
  res.end(JSON.stringify({ startUpTime: time, }));
});
