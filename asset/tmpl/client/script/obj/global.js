import {
  ClientFetch,
} from 'manner.js/client';
import Emitter from '~/client/script/class/Emitter';
import Location from '~/client/script/class/Location';

const emitter = new Emitter();
const location = new Location();
const clientFetch = new ClientFetch();

clientFetch.addFilter(429, async (response) => {
  const { time, ip  } = await response.json();
  localStorage.setItem('time', String(time));
  localStorage.setItem('ip', ip);
  emitter.send('block:true');
});
clientFetch.addFilter(500, async (response) => {
  emitter.send('error:true');
});
clientFetch.addFilter(512, async (response) => {
  emitter.send('busy:true');
});

export default {
  emitter,
  location,
  clientFetch,
  queryParams: null,
  pathVariables: null,
};
