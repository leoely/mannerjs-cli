#!/usr/bin/env node

import help from '~/lib/command/help';
import init from '~/lib/command/init';
import update from '~/lib/command/update';

async function main() {
  const [_1, _2, one, ...rest] = process.argv;
  switch (one) {
    case 'init':
      await init(...rest);
      break;
    case 'update':
      await update(...rest);
      break;
    default:
      help(...rest);
  }
  process.exit(0);
}

main();
