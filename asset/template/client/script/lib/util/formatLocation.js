import {
  HighLight,
  LocationLexer,
} from 'glow.js';
import locationTemplate from '~/client/script/lib/template/locationTemplate';

function getTokensLength(tokens){
  let ans = 0;
  tokens.forEach(({ elem }) => {
    ans += elem.length;
  });
  return ans;
}

export default function formatLocation(location) {
  const highLight = new HighLight();
  highLight.addLexer(LocationLexer);
  const tokens = highLight.parse(location);
  if (getTokensLength(tokens) === location.length) {
    return tokens.map((e, idx) => locationTemplate(e, idx));
  } else {
    return location;
  }
}
