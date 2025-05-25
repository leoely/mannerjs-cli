import {
  WebRouter,
  FileRouter,
} from 'advising.js';
import Fulmination from 'fulmination';

const fulmination: Fulmination = new Fulmination();
const modify: FileRouter = new FileRouter({ debug: false, hideError: true, });
const file: FileRouter = new FileRouter({ debug: false, hideError: true, });
const compress: FileRouter = new FileRouter({ debug: false, hideError: true, });
const forward: WebRouter = new WebRouter({ debug: false, });
const webRouter: WebRouter = new WebRouter({ debug: false, hideError: true, });
const aheadObstruct: WebRouter = new WebRouter({ debug: false, hideError: true, });
const ownObstruct: WebRouter = new WebRouter({ debug: false, hideError: true, });

export default {
  webRouter,
  forward,
  modify,
  file,
  compress,
  fulmination,
  aheadObstruct,
  ownObstruct,
};
