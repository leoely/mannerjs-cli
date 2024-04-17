#!/usr/bin/env node

import help from '~/lib/command/help';
import dir from '~/lib/command/dir';
import config from '~/lib/command/config';
import deps from '~/lib/command/deps';
import script from '~/lib/command/script';

async function main() {
  const [_1, _2, one, ...rest] = process.argv;
  //switch (one) {
    //case 'dir':
      //await dir(...rest);
      //break;
    //case 'config':
      //await config(...rest);
      //break;
    //case 'deps':
      //await deps(...rest);
      //break;
    //case 'script':
      //await script(...rest);
      //break;
    //default:
      help(...rest);
      //break;
  //}
  //process.exit(0);
}

main();
