import chalk from 'chalk';

export default function commandTip(command, tip) {
  return '  ' + chalk.bold(command) + ': ' + tip;
}
