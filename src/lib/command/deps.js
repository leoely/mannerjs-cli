import { execSync, } from 'child_process';
import chalk from 'chalk';
import { askQuestion, } from 'mien';

async function addDeps(deps, dev) {
  const result = await askQuestion(
    'Are you sure install ' + chalk.yellow('"' + deps + '"') + ' in current project.'
  );
  if (result === true) {
    if (dev === true) {
      execSync('yarn add --dev ' + deps, { stdio: 'inherit', });
    } else {
      execSync('yarn add ' + deps, { stdio: 'inherit', });
    }
    console.log([
      chalk.bold('The ' + chalk.green('"' + deps + '"') + ' dependence had be installed.'),
      '',
    ].join('\n'));
  }
}

export default async function deps(...param) {
  await addDeps('@babel/cli', true);
  await addDeps('@babel/core', true);
  await addDeps('@babel/preset-env', true);
  await addDeps('@babel/preset-react', true);
  await addDeps('@babel/register', true);
  await addDeps('autoprefixer', true);
  await addDeps('babel-loader', true);
  await addDeps('babel-plugin-root-import', true);
  await addDeps('css-loader', true);
  await addDeps('file-loader', true);
  await addDeps('gulp-babel', true);
  await addDeps('html-webpack-plugin', true);
  await addDeps('postcss-loader', true);
  await addDeps('style-loader', true);
  await addDeps('sugarss', true);
  await addDeps('webpack', true);
  await addDeps('webpack-cli', true);
  await addDeps('webpack-dev-server', true);

  await addDeps('react', false);
  await addDeps('react-dom', false);
  await addDeps('gulp', false);
  await addDeps('glow.js', false);
  await addDeps('manner.js', false);
}
