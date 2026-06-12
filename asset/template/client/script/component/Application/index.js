import Router from '~/client/script/component/Router';
import SinglePageApplication from '~/client/script/decorator/SinglePageApplication';

@SinglePageApplication
class Application extends Router {
  async ownComponentDidMount() {
    const module = await import('~/client/script/page/Home');
    const Home = module.default;
    this.addPage('/', Home);
  }
}

export default Application;
