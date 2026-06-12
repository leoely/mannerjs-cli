import SinglePageApplication from '~/client/script/decorator/SinglePageApplication';

@SinglePageAppliction
class Application extends React.Component {
  async ownCompoentDidMount() {
    const module = await import('~/client/script/page/Home');
    const Home = module.default;
    this.addPage('/', Home);
  }
}

export default Application;
