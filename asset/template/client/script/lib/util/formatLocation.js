import {
  HighLight,
  LocationLexer,
} from 'glow.js';
import locationTemplate from '~/client/script/lib/template/locationTemplate';

function getTokensLength(tokens){
  if (!Array.isArray(tokens)) {
    throw new Error('[Error] The parameter tokens should be of array type.');
  }
  let ans = 0;
  tokens.forEach(({ elem }) => {
    if (typeof elem !== 'string') {
      throw new Error('[Error] The parameter elem should be of string type.');
    }
    ans += elem.length;
  });
  return ans;
}

export default function formatLocation(location) {
  if (typeof location !== 'string') {
    throw new Error('[Error] The parameter location should be of string type.');
  }
  const highLight = new HighLight();
  highLight.addLexer(LocationLexer);
  const tokens = highLight.parse(location);
  if (getTokensLength(tokens) === location.length) {
    return tokens.map((e, idx) => locationTemplate(e, idx));
  } else {
    return location;
  }
}
