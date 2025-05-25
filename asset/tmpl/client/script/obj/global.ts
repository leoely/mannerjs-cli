import {
  ClientFetch,
} from 'manner.js/client';
import Emitter from '~/client/script/class/Emitter';
import Location from '~/client/script/class/Location';

const emitter: Emitter = new Emitter();
const location: Location = new Location();
const clientFetch: ClientFetch = new ClientFetch();

clientFetch.addFilter(429, async (response: Response) => {
  const { time, ip  } = await response.json();
  localStorage.setItem('time', String(time));
  localStorage.setItem('ip', ip);
  emitter.send('block:true');
});


clientFetch.addFilter(500, async (response: Response) => {
  emitter.send('error:true');
});

clientFetch.addFilter(512, async (response: Response) => {
  const { consume, } = await response.json();
});

export default {
  emitter,
  location,
  clientFetch,
};
