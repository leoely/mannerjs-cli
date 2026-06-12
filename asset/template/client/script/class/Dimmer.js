const showKey = Symbol.for('show');
const hiddenKey = Symbol.for('hidden');

class Dimmer {
  constructor() {
    const pageElem = document.getElementById('page');
    if (pageElem === null) {
      throw new Error('[Error] The page element does not exist in the DOM.');
    }
    this.pageElem = pageElem;
  }

  [showKey]() {
    const { pageElem, } = this;
    pageElem.style.backgroundColor = 'rgb(255, 255, 255)';
    pageElem.style.filter = 'brightness(0.5)';
  }

  [hiddenKey]() {
    const { pageElem, } = this;
    pageElem.style.backgroundColor = null;
    pageElem.style.filter = null;
  }
}

export default Dimmer;
