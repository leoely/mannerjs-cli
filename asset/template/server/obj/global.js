import {
  WebRouter,
  FileRouter,
} from 'advising.js';

const modify = new FileRouter({ debug: false, hideError: true, });
const file = new FileRouter({ debug: false, hideError: true, });
const compress = new FileRouter({ debug: false, hideError: true, });
const forward = new WebRouter({ debug: false, hideError: true, });
const aheadObstruct = new WebRouter({ debug: false, hideError: true, });
const ownObstruct = new WebRouter({ debug: false, hideError: true, });
const staticStop = new FileRouter({ debug: false, hideError: true, });
const wr = new WebRouter({ debug: false, hideError: true, });
const sys = { main: {}, };

export default {
  sys,
  wr,
  forward,
  modify,
  file,
  compress,
  aheadObstruct,
  ownObstruct,
  staticStop,
};
