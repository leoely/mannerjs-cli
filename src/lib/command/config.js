import { copyFileSync, existsSync, } from 'fs';
import path from 'path';
import chalk from 'chalk';
import askQuestion from '~/lib/util/askQuestion';

async function addConfigFile(name, configPath, currentPath) {
  const destPath = path.join(currentPath, name);
  if (!existsSync(destPath)) {
    let result = await askQuestion(
      `Are you sure add ${name} in current directory`
    );
    if (result === true) {
      copyFileSync(
        path.join(configPath, name),
        destPath,
      );
    }
  } else {
    console.log([
      '',
      chalk.bold('The "' + chalk.yellow(name) + '" had already exist.'),
      '',
    ].join('\n'));
  }
}

export default async function config(...param) {
  const configPath = path.resolve(
    __dirname, '..', '..', '..', 'asset', 'config'
  );
  const currentPath = path.resolve('.');
  await addConfigFile('webpack.config.dev.babel.js', configPath, currentPath);
  await addConfigFile('webpack.config.pro.babel.js', configPath, currentPath);
  await addConfigFile('postcss.config.js', configPath, currentPath);
  await addConfigFile('babel.config.json', configPath, currentPath);
  await addConfigFile('.editorconfig', configPath, currentPath);
  await addConfigFile('.eslintignore', configPath, currentPath);
  await addConfigFile('.eslintrc', configPath, currentPath);
  await addConfigFile('.gitattributes', configPath, currentPath);
}
