import chalk from 'chalk';
import '~/lib/util/checkVersion';
import commandTip from '~/lib/util/commandTip';

export default function help(...param) {
  console.log([
    '',
    '  █▀▄▀█ ▄▀█ █▄░█ █▄░█ █▀▀ █▀█',
    '  █░▀░█ █▀█ █░▀█ █░▀█ ██▄ █▀▄',
    '',
    '  ' + chalk.bold('Manner.js command' + ':'),
    '',
    commandTip('dir', 'Initial frontend project directory structure.'),
    '',
    commandTip('config', 'Add frontend project related configuration file'),
    '',
    commandTip('deps', 'Add frontend project related package dependencies.'),
    '',
    commandTip('script', 'Add frontend project related scripts to package.json'),
    '',
  ].join('\n'));
}
