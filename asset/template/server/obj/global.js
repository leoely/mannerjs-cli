import {
  WebRouter,
  FileRouter,
  ObjectRouter,
} from 'advising.js';

const fwd = new WebRouter({ debug: false, hideError: true, });
const wr = new WebRouter({ debug: false, hideError: true, });
const or = new ObjectRouter({ debug: false, hideError: true, });

const fr1 = new FileRouter({ debug: false, hideError: true, });
const fr2 = new FileRouter({ debug: false, hideError: true, });
const fr3 = new FileRouter({ debug: false, hideError: true, });
const fr4 = new FileRouter({ debug: false, hideError: true, });
const wr1 = new WebRouter({ debug: false, hideError: true, });
const wr2 = new WebRouter({ debug: false, hideError: true, });

const fr1Key = Symbol.for('fr1');
const fr2Key = Symbol.for('fr2');
const fr3Key = Symbol.for('fr3');
const fr4Key = Symbol.for('fr4');
const wr1Key = Symbol.for('wr1');
const wr2Key = Symbol.for('wr2');

export default {
  or,
  wr,
  fwd,
  [fr1Key]: fr1,
  [fr2Key]: fr2,
  [fr3Key]: fr3,
  [fr4Key]: fr4,
  [wr1Key]: wr1,
  [wr2Key]: wr2,
};
