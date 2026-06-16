import Router from '~/client/script/component/Router';
import SinglePageApplication from '~/client/script/decorator/SinglePageApplication';
import MainMethod from '~/client/script/decorator/MainMethod';
import RestMethod from '~/client/script/decorator/RestMethod';

@SinglePageApplication
class Application extends Router {
  constructor(props) {
    super(props);
  }

  @MainMethod
  async ownComponentDidMount() {
    const module = await import('~/client/script/page/Home');
    const Home = module.default;
    this.addPage('/', Home);
    await this.addTestPages();
  }

  @RestMethod(1)
  async addTestPages() {
    const { mode, } = this.props;
    if (mode === 'test') {
      const module = await import('~/client/script/page/Test');
      const Test = module.default;
      this.addPage('/test', Test);
    }
  }
}

export default Application;
