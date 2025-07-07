import childProcess from 'child_process';
import fs from 'fs';
import path from 'path';
import Fulmination from 'fulmination';
import {
  checkVersion,
  askQuestion,
  emphasis,
  checkDependencies,
  tick,
} from 'mien';
import copyFile from '~/lib/util/copyFile';

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
      test: 'yarn playwright test --ui',
    },
    devDependencies: {
      '@babel/cli': '^7.24.1',
      '@babel/core': '^7.24.3',
      '@babel/preset-env': '^7.24.3',
      '@babel/preset-react': '^7.24.1',
      '@babel/preset-typescript': '^7.27.1',
      '@babel/register': '^7.23.7',
      '@fortawesome/fontawesome-svg-core': '^6.7.2',
      '@fortawesome/free-brands-svg-icons': '^6.7.2',
      '@fortawesome/free-regular-svg-icons': '^6.7.2',
      '@fortawesome/free-solid-svg-icons': '^6.7.2',
      '@playwright/test': '^1.53.1',
      '@types/node': '^24.0.3',
      'autoprefixer': '^10.4.19',
      'babel-loader': '^9.1.3',
      'babel-plugin-root-import': '^6.6.0',
      'babel-preset-minify': '^0.5.2',
      'css-loader': '^6.10.0',
      'file-loader': '^6.2.0',
      'gulp-babel': '^8.0.0',
      'html-webpack-plugin': '^5.6.0',
      'postcss-loader': '^8.1.1',
      'style-loader': '^3.3.4',
      'sugarss': '^4.0.1',
      'ts-loader': '^9.5.2',
      'typescript': '^5.8.3',
      'webpack': '^5.91.0',
      'webpack-cli': '^5.1.4',
      'webpack-dev-server': '^5.0.4'
    },
    dependencies: {
      '@fortawesome/react-fontawesome': '^0.2.2',
      'advising.js': '^1.0.15',
      'fulmination': '^1.1.13',
      'glow.js': '^1.0.9',
      'gulp': '^5.0.0',
      'gulp-typescript': '^6.0.0-alpha.1',
      'manner.js': '^1.0.17',
      'mien': '^1.0.20',
      'normalize.css': '^8.0.1',
      'postcss': '^8.5.3',
      'react': '^19.1.0',
      'react-dom': '^19.1.0'
    }
  });
  const { name, } = projectPackageData;
  const needEslint = await askQuestion('(+) bold: Does the current project need to ' + emphasis('eslint') + '(+) bold: .');
  const needTailwind = await askQuestion('(+) bold: Does the current project need to ' + emphasis('tailwind') + '(+) bold: .');
  const needGit= await askQuestion('(+) bold: Does the current project need to be initialize as ' + emphasis('git') + '(+) bold: * project.');
  currentPath = path.join(currentPath, name);
  fs.mkdirSync(currentPath);
  process.chdir(currentPath);
  const fulmination = new Fulmination();
  fulmination.scan(tick() + '(+) bold: The ' + emphasis('project') + '(+) bold: * successfully created. &');
  if (needEslint === true) {
    projectPackageData.scripts['lint'] = 'eslint ./src';
    projectPackageData.devDependencies['@eslint/css'] = '^0.8.1';
    projectPackageData.devDependencies['@eslint/js'] = '^9.27.0';
    projectPackageData.devDependencies['@eslint/json'] = '^0.12.0';
    projectPackageData.devDependencies['@eslint/markdown'] = '^6.4.0';
    projectPackageData.devDependencies['eslint'] = '^9.27.0';
    projectPackageData.devDependencies['eslint-plugin-react'] = '^7.37.5';
  }
  if (needTailwind === true) {
    projectPackageData.dependencies['@tailwindcss/postcss'] = '^4.1.7';
    projectPackageData.dependencies['postcss'] = '^8.5.3';
    projectPackageData.dependencies['tailwindcss'] = '^4.1.7';
    projectPackageData.dependencies['fulmination'] = '^1.1.3';
    projectPackageData.dependencies['mien'] = '^1.0.5';
  }
  const modulePath = path.resolve(__dirname, '..', '..', '..')
  const assetPath = path.join(modulePath, 'asset');
  fulmination.scan('(+) &');
  fs.writeFileSync(path.join(currentPath, 'package.json'), JSON.stringify(projectPackageData, null, 2));
  fulmination.scan(tick() + '(+) bold: File ' + emphasis('package.json') + '(+) bold: * created successful. &');
  childProcess.execSync('yarn install', { stdio: 'inherit', });
  fulmination.scan(tick() + '(+) bold: The ' + emphasis('yarn') + '(+) bold: * installation related dependencies. &');
  const tmplPath = path.join(assetPath, 'tmpl');
  fs.mkdirSync(path.join(currentPath, 'src'));
  fs.cpSync(tmplPath, path.join(currentPath, 'src'), { recursive: true, });
  const serverIndexPath = path.join(currentPath, 'src', 'server', 'index.js');
  const serverIndexString = fs.readFileSync(serverIndexPath).toString();
  fs.writeFileSync(serverIndexPath, serverIndexString.replaceAll('temporary', name));
  fulmination.scan(tick() + '(+) bold: The ' + emphasis('src') + '(+) bold: *  was copied successfully. &');
  const configPath = path.join(assetPath, 'config');
  copyFile('.editorconfig', configPath, currentPath);;
  copyFile('babel.config.json', configPath, currentPath);;
  copyFile('tsconfig.json', configPath, currentPath);;
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
  copyFile('playwright.config.ts', configPath, currentPath);
  fulmination.scan(tick() + emphasis('Playwright') + '(+) bold: * integration tests were successfully replicated. &');
  currentPath = path.join(currentPath, 'asset');
  fs.mkdirSync(currentPath);
  process.chdir(currentPath);
  childProcess.execSync('openssl genrsa -out ' + name + '-key.pem 2048', { stdio: 'inherit', });
  childProcess.execSync('openssl req -new -sha256 -key ' + name + '-key.pem -out ' + name + '-csr.pem' , { stdio: 'inherit', });
  childProcess.execSync('openssl x509 -req -in ' + name + '-csr.pem -signkey ' + name + '-key.pem -out ' + name + '-cert.pem ' , { stdio: 'inherit', });
  fulmination.scan(tick() + '(+) bold: The ' + emphasis('certificate') + '(+) bold: *  successfully created. &');
  const imgPath = path.join(assetPath, 'img');
  const imgName = 'favicon.png';
  fs.copyFileSync(path.join(imgPath, imgName), path.join(currentPath, imgName));
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
