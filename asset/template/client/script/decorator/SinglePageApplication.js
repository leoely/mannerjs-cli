import Router from '~/client/script/component/Router';

function SinglePageApplication(value, { kind, name, }) {
  if (kind === 'class') {
    return class extends Router {
      constructor(props) {
        super(props);
      }
    }
  }
}

export default SinglePageApplication;
