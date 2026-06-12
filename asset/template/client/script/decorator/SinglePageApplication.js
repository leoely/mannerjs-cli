import Router from '~/client/script/component/Router';

function SinglePageApplication(value, { kind, name, }) {
  if (kind === 'class') {
    return class extends value {
      constructor(props) {
        super(props);
      }
    }
  }
}

export default SinglePageApplication;
