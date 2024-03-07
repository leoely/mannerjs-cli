import chalk from 'chalk';
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
  ].join('\n'));
}
