import Router from '~/client/script/component/Router';
import SinglePageApplication from '~/client/script/decorator/SinglePageApplication';
import MainMethod from '~/client/script/decorator/MainMethod';
import RestMethod from '~/client/script/decorator/RestMethod';
import global from '~/client/script/obj/global';

const {
  location,
} = global;

@SinglePageApplication
class Application extends Router {
  constructor(props) {
    super(props);
  }

  setUpCurrentPage() {
    location.to('/404');
  }

  @MainMethod
  async ownComponentDidMount() {
    const module = await import('~/client/script/page/Home');
    const Home = module.default;
    this.addPage('/', Home);
    await this.addTestPages();
    const { mode, } = this.props;
    if (mode === 'develop') {
      this.setUpCurrentPage();
    }
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
