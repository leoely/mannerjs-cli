function SinglePageApplication(value, { kind, name, }) {
  if (kind === 'class') {
    return class extends value {
      constructor(props) {
        super(props);
        const { mode, } = this.props;
        switch (mode) {
          case 'test':
          console.log('^^[Note] that this is currently in tests mode and cannot be used for release.');
        }
      }
    }
  }
}

export default SinglePageApplication;
