import Emitter from '~/client/script/class/Emitter';
import Location from '~/client/script/class/Location';

const emitter = new Emitter();
const location = new Location();

const global = {
  emitter,
  location,
  router: null,
};

export default global;
