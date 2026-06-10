class Dimmer {
  constructor() {
    const pageElem = document.getElementById('page');
    if (pageElem === null) {
      throw new Error('[Error] The page element does not exist in the DOM.');
    }
    this.pageElem = pageElem;
  }

  show() {
    const { pageElem, } = this;
    pageElem.style.backgroundColor = 'rgb(255, 255, 255)';
    pageElem.style.filter = 'brightness(0.5)';
  }

  hidden() {
    const { pageElem, } = this;
    pageElem.style.backgroundColor = null;
    pageElem.style.filter = null;
  }
}

export default Dimmer;
