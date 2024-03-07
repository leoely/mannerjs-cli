import { copyFileSync, } from 'fs';
import path from 'path';
import askQuestion from '~/lib/util/askQuestion';

export default async function config(...param) {
  const configPath = path.resolve(
    __dirname, '..', '..', '..', 'asset', 'config'
  );
  const currentPath = path.resolve('.');
  let result = await askQuestion(
    'Are you sure add webpack.config.dev.babel.js in current directory'
  );
  if (result === true) {
    copyFileSync(
      path.join(configPath, 'webpack.config.dev.babel.js'),
      path.join(currentPath, 'webpack.config.dev.babel.js'),
    );
  }
  result = await askQuestion(
    'Are you sure add webpack.config.pro.babel.js in current directory'
  );
  if (result === true) {
    copyFileSync(
      path.join(configPath, 'webpack.config.pro.babel.js'),
      path.join(currentPath, 'webpack.config.pro.babel.js'),
    );
  }
  result = await askQuestion(
    'Are you sure add postcss.config.js in current directory'
  );
  if (result === true) {
    copyFileSync(
      path.join(configPath, 'postcss.config.js'),
      path.join(currentPath, 'postcss.config.js'),
    );
  }
  result = await askQuestion(
    'Are you sure add babel.config.json in current directory'
  );
  if (result === true) {
    copyFileSync(
      path.join(configPath, 'babel.config.json'),
      path.join(currentPath, 'babel.config.json'),
    );
  }
}
