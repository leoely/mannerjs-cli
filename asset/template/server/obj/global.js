import {
  WebRouter,
  FileRouter,
} from 'advising.js';

const fr1 = new FileRouter({ debug: false, hideError: true, });
const fr2 = new FileRouter({ debug: false, hideError: true, });
const fr3 = new FileRouter({ debug: false, hideError: true, });
const fr4  = new FileRouter({ debug: false, hideError: true, });
const wr1 = new WebRouter({ debug: false, hideError: true, });
const wr2 = new WebRouter({ debug: false, hideError: true, });
const fwd = new WebRouter({ debug: false, hideError: true, });
const wr0 = new WebRouter({ debug: false, hideError: true, });
const sys = {};

export default {
  sys,
  wr,
  fwd,
  fr1,
  fr2,
  fr3,
  fr4,
  wr1,
  wr2,
};
