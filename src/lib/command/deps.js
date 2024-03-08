import { execSync, } from 'child_process';
import chalk from 'chalk';
import askQuestion from '~/lib/util/askQuestion';

async function addDeps(deps) {
  const result = await askQuestion(
    'Are you sure install ' + chalk.yellow('"' + deps + '"') + ' in current project.'
  );
  if (result === true) {
    execSync('yarn add --dev ' + deps, { stdio: 'inherit', });
    console.log([
      chalk.bold('The ' + chalk.green('"' + deps + '"') + ' dependence had be installed.'),
      '',
    ].join('\n'));
  }
}

export default async function deps(...param) {
  await addDeps('@babel/cli');
  await addDeps('@babel/core');
  await addDeps('@babel/preset-env');
  await addDeps('@babel/preset-react');
  await addDeps('@babel/register');
  await addDeps('autoprefixer');
  await addDeps('babel-loader');
  await addDeps('babel-plugin-root-import');
  await addDeps('css-loader');
  await addDeps('file-loader');
  await addDeps('gulp-babel');
  await addDeps('gulp');
  await addDeps('html-webpack-plugin');
  await addDeps('postcss-loader');
  await addDeps('style-loader');
  await addDeps('sugarss');
  await addDeps('webpack');
  await addDeps('webpack-cli');
  await addDeps('webpack-dev-server');
}
