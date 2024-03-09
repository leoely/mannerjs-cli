import { cpSync, existsSync, } from 'fs';
import path from 'path';
import chalk from 'chalk';
import askQuestion from '~/lib/util/askQuestion';

export default async function dir(...param) {
  const currentPath = path.resolve('.');
  if (!existsSync(path.join(currentPath, 'src'))) {
    let result = await askQuestion(
      'Are you sure add standard ' + chalk.blue('"src/"') + ' in current directory.'
    );
    const templatePath = path.resolve(
      __dirname, '..', '..', '..', 'asset', 'template'
    );
    if (result === true) {
      cpSync(templatePath, path.join(currentPath, 'src'), {
        recursive: true,
      });
    }
  } else {
    console.log([
      '',
      chalk.bold('The source file directory ' + chalk.red('"src/"') + ' had already exist."'),
      '',
    ].join('\n'));
  }
}
