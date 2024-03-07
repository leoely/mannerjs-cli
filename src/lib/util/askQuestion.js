import * as readline from 'readline';
import { stdin as input, stdout as output } from 'process';
import chalk from 'chalk';

function completer(line) {
  const completions = 'yes  y n no'.split(' ');
  const hits = completions.filter((c) => c.startsWith(line));
  return [hits.length ? hits : completions, line];
}

export default async function askQuestion(question) {
  const rl = readline.createInterface({
    input,
    output,
    completer,
  });
  const answer = await new Promise((resolve, reject) => {
    rl.question(
      chalk.bold(question) +
      'yes[' + chalk.bold('Y') + ']/no[' + chalk.bold('N') + ']?\n',
      (ans) => resolve(ans),
    );
  });
  rl.close();
  let result;
  switch (answer.toLowerCase()) {
    case 'y':
    case 'yes':
      result = true;
      break;
    case 'n':
    case 'no':
      result = false;
      break;
    default:
      result = false;
      break;
  }
  return result;
}
