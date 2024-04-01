import { execSync, } from 'child_process';
import chalk from 'chalk';
import compareVersion from '~/lib/util/compareVersion';

function greaterOrEqualVersion(v1, v2) {
  const result = compareVersion(v1, v2, (sv1, sv2) => sv1 >= sv2);
  return !result.some((flag) => !flag);
}

const v = execSync('node -v').toString();
if (!greaterOrEqualVersion(v.substring(0, v.length - 1), 'v21.6.2')) {
  console.error([
    '',
    chalk.bold('The version of node currently used is lower:'),
    '',
    'please use node version greater or equal than v19.3.0.',
    'use command `' + chalk.bold('node -v') + '` check current version of node.',
    '',
    chalk.bold('the following are possible solutions:'),
    '',
    ' - visit the officical website of node to download and install the latest version node.',
    '   officical website address of node is ' + chalk.bold('https://nodejs.org'),
    '',
    ' - use command line tool `' + chalk.bold('nvm') + '` install and use lastest version node.',
    '   github address of nvm is ' + chalk.bold('https://github.com/nvm-sh/nvm') + '.',
    '',
  ].join('\n'));
  process.exit(0);
}
