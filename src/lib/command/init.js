import childProcess from 'child_process';
import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import Fulmination from 'fulmination';
import {
  checkVersion,
  emphasis,
  checkDependencies,
  tick,
} from 'mien';
import copyFile from '~/lib/util/copyFile';

function installDevDep(dep) {
  childProcess.execSync('yarn add --dev ' + dep + '@latest', { stdio: 'inherit', });
}

function installDep(dep) {
  childProcess.execSync('yarn add ' + dep + '@latest', { stdio: 'inherit', });
}

export default async function init(...param) {
  checkVersion('v21.6.2');
  await checkDependencies(['yarn', 'git']);
  let currentPath = path.resolve('.');
  childProcess.execSync('yarn init', { stdio: 'inherit', });
  const projectPackageJSONPath = path.join(currentPath, 'package.json');
  const projectPackageJSON = fs.readFileSync(path.join(currentPath, 'package.json')).toString();
  fs.rmSync(projectPackageJSONPath);
  const projectPackageData = Object.assign(JSON.parse(projectPackageJSON), {
    scripts: {
      build: 'gulp build',
      run: 'yarn run build && node dist/index.js --port 8888 --development true --safe true',
      dev: 'webpack serve --config webpack.config.dev.babel.js',
      pro: 'webpack --config webpack.config.pro.babel.js',
      'run:test1': 'yarn run build && node dist/index.js --port 8888 --development true --safe false',
      'run:test2': 'yarn run build && node dist/index.js --port 8888 --development false --safe false --condition 1',
      test: 'yarn playwright test --ui',
    },
  });
  const { name, } = projectPackageData;
  const { dependencies, } = await inquirer.prompt({
    name: 'dependencies',
    message: 'Select the depnendencies required by the project.',
    type:'checkbox',
    choices: ['eslint', 'tailwind', 'git', 'mui'],
  });
  let needEslint = false;
  let needTailwind = false;
  let needGit = false;
  let needMui = false;
  dependencies.forEach((dependence) => {
    switch (dependence) {
      case 'eslint':
        needEslint = true;
        break;
      case 'tailwind':
        needTailwind = true;
        break;
      case 'git':
        needGit = true;
        break;
      case 'mui':
        needMui = true;
        break;
      default:
        throw new Error('[Error] Encountered unknown dependency.');
    }
  });
  currentPath = path.join(currentPath, name);
  fs.mkdirSync(currentPath);
  process.chdir(currentPath);
  const fulmination = new Fulmination();
  fulmination.scan(tick() + '(+) bold: The ' + emphasis('project') + '(+) bold: * successfully created. &');
  if (needEslint === true) {
    projectPackageData.scripts['lint'] = 'eslint ./src';
    installDevDep('@eslint/css');
    installDevDep('@eslint/js');
    installDevDep('@eslint/json');
    installDevDep('@eslint/markdown');
    installDevDep('eslint');
    installDevDep('eslint-plugin-react');;
  }
  if (needTailwind === true) {
    installDep('@tailwindcss/postcss');
    installDep('tailwindcss');
  }
  if (needMui === true) {
    installDep('@emotion/react');
    installDep('@emotion/styled');
    installDep('@mui/material');
  }
  const modulePath = path.resolve(__dirname, '..', '..', '..')
  const assetPath = path.join(modulePath, 'asset');
  fulmination.scan('(+) &');
  fs.writeFileSync(path.join(currentPath, 'package.json'), JSON.stringify(projectPackageData, null, 2));
  fulmination.scan(tick() + '(+) bold: File ' + emphasis('package.json') + '(+) bold: * created successful. &');
  installDep('@fortawesome/react-fontawesome');
  installDep('advising.js');
  installDep('browser-advising');
  installDep('fulmination');
  installDep('glow.js');
  installDep('gulp');
  installDep('manner.js');
  installDep('mien');
  installDep('normalize.css');
  installDep('postcss');
  installDep('react');
  installDep('react-dom');
  installDevDep('@babel/core');
  installDevDep('@babel/cli');
  installDevDep('@babel/preset-env');
  installDevDep('@babel/preset-react');
  installDevDep('@babel/preset-react');
  installDevDep('@babel/plugin-proposal-decorators');
  installDevDep('@babel/register');
  installDevDep('@fortawesome/fontawesome-svg-core');
  installDevDep('@fortawesome/free-brands-svg-icons');
  installDevDep('@fortawesome/free-regular-svg-icons');
  installDevDep('@fortawesome/free-solid-svg-icons');
  installDevDep('@playwright/test');
  installDevDep('@types/node');
  installDevDep('autoprefixer');
  installDevDep('babel-loader');
  installDevDep('babel-plugin-root-import');
  installDevDep('babel-preset-minify');
  installDevDep('css-loader');
  installDevDep('file-loader');
  installDevDep('gulp-babel');
  installDevDep('html-webpack-plugin');
  installDevDep('postcss-loader');
  installDevDep('style-loader');
  installDevDep('sugarss');
  installDevDep('minimizer-webpack-plugin');
  installDevDep('ts-loader');
  installDevDep('webpack');
  installDevDep('webpack-cli');
  installDevDep('webpack-dev-server');
  fulmination.scan(tick() + '(+) bold: The ' + emphasis('yarn') + '(+) bold: * installation related dependencies. &');
  const templatePath = path.join(assetPath, 'template');
  fs.mkdirSync(path.join(currentPath, 'src'));
  fs.cpSync(templatePath, path.join(currentPath, 'src'), { recursive: true, });
  const HttpHandlePath = path.join(currentPath, 'src', 'server', 'class', 'HttpHandle.js');
  const HttpHandleString = fs.readFileSync(HttpHandlePath).toString();
  fs.writeFileSync(HttpHandlePath, HttpHandleString.replaceAll('temporary', name));
  fulmination.scan(tick() + '(+) bold: The ' + emphasis('src') + '(+) bold: *  was copied successfully. &');
  const configPath = path.join(assetPath, 'config');
  copyFile('.editorconfig', configPath, currentPath);;
  copyFile('babel.config.json', configPath, currentPath);;
  if (needEslint === true) {
    copyFile('.eslintignore', configPath, currentPath);;
    copyFile('.eslintrc', configPath, currentPath);
    copyFile('eslint.config.mjs', configPath, currentPath);
  }
  if (needGit === true) {
    copyFile('.gitattributes', configPath, currentPath);
    copyFile('%.gitignore', configPath, currentPath);
    fs.renameSync(path.join(currentPath, '%.gitignore'), path.join(currentPath, '.gitignore'));
  }
  copyFile('gulpfile.babel.js', configPath, currentPath);
  if (needTailwind === true) {
    copyFile('%postcss@tailwind.config.mjs', configPath, currentPath);
    fs.renameSync(path.join(currentPath, '%postcss@tailwind.config.mjs'), path.join(currentPath, 'postcss.config.mjs'));
  } else {
    copyFile('postcss.config.mjs', configPath, currentPath);
  }
  copyFile('webpack.config.dev.babel.js', configPath, currentPath);
  copyFile('webpack.config.pro.babel.js', configPath, currentPath);
  fulmination.scan(tick() + '(+) bold: The ' + emphasis('configuration') + '(+) bold: * was copied successfully. &');
  if (needGit === true) {
    childProcess.execSync('git init', { stdio: 'inherit', });
    fulmination.scan(tick() + '(+) bold: The ' + emphasis('git') + '(+) bold: * project successfully initialized. &');
  }
  const testPath = path.join(assetPath, 'test');
  fs.mkdirSync(path.join(currentPath, 'test'));
  fs.cpSync(testPath, path.join(currentPath, 'test'), { recursive: true, });
  copyFile('playwright.config.js', configPath, currentPath);
  fulmination.scan(tick() + emphasis('Playwright') + '(+) bold: * integration tests were successfully replicated. &');
  currentPath = path.join(currentPath, 'asset');
  fs.mkdirSync(currentPath);
  process.chdir(currentPath);
  childProcess.execSync('openssl genrsa -out ' + name + '-key.pem 2048', { stdio: 'inherit', });
  childProcess.execSync('openssl req -new -sha256 -key ' + name + '-key.pem -out ' + name + '-csr.pem' , { stdio: 'inherit', });
  childProcess.execSync('openssl x509 -req -in ' + name + '-csr.pem -signkey ' + name + '-key.pem -out ' + name + '-cert.pem ' , { stdio: 'inherit', });
  fulmination.scan(tick() + '(+) bold: The ' + emphasis('certificate') + '(+) bold: *  successfully created. &');
  const imagePath = path.join(assetPath, 'image');
  const imageName = 'favicon.png'; fs.copyFileSync(path.join(imagePath, imageName), path.join(currentPath, imageName));
  fulmination.scan(tick() + '(+) bold: The ' + emphasis('favico') + '(+) bold: *  file was copied successfully. &');
  currentPath = path.resolve(currentPath, '..');
  const mannerPath = path.join(currentPath, '.manner');
  fs.mkdirSync(mannerPath);
  const modulePackageJSON = fs.readFileSync(path.join(modulePath, 'package.json')).toString();
  const modulePackageData = JSON.parse(modulePackageJSON);
  const { version, } = modulePackageData;
  fs.writeFileSync(path.join(mannerPath, 'version'), version);
  fulmination.scan(tick() + '(+) bold: Successful marking of ' + emphasis('manner') + '(+) bold: * project. &');
}
