import { HighLight, LocationLexer, }from 'glow.js';
import locationTemplate from '~/client/script/lib/template/locationTemplate';

export default function formateLocation(version) {
  const highLight = new HighLight();
  highLight.addLexer(LocationLexer);
  return highLight.parse(version).map((e) => locationTemplate(e));
}
