class Dimmer {
  constructor() {
    this.page = document.getElementById('page');
  }

  show() {
    const { page, } = this;
    page.style.backgroundColor = 'rgb(255, 255, 255)';
    page.style.filter = 'brightness(0.5)';
  }

  hidden() {
    const { page, } = this;
    page.style.backgroundColor = null;
    page.style.filter = null;
  }
}

export default Dimmer;
