import {
  HighLight,
  NumberLexer,
} from 'glow.js';
import numberTemplate from '~/client/script/lib/template/numberTemplate';

function splitNumber(number) {
  const chars = [];
  let count = 0;
  while (true) {
    count += 1;
    chars.unshift(number % 10);
    if (count === 3) {
      count = 0;
      chars.unshift("'");
    }
    number = Math.floor(number / 10);
    if (number === 0) {
      break;
    }
  }
  return chars.join('');
}

export default function formatNumber(number) {
  if (typeof number !== 'number') {
    throw new Error('[Error]');
  }
  const highLight = new HighLight();
  highLight.addLexer(NumberLexer);
  const tokens = highLight.parse(splitNumber(number));
  return tokens.map((e, idx) => NumberTemplate(e, idx));
}
