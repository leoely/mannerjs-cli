import { copyFileSync, } from 'node:fs';
import path from 'path';
import askQuestion from '~/lib/util/askQuestion';

export default async function config(...param) {
  const configPath = path.resolve(__dirname, '..', '..', 'asset', 'config');
  const currentPath = path.resolve('.');
  const result = await askQuestion(
    'Are you sure add webpack.config.dev.babel.js in current directory'
  );
  if (result === true) {
    copyFileSync(
      path.join(configPath, 'webpack.config.dev.babel.js'),
      currentPath,
    );
  }
  const result = await askQuestion(
    'Are you sure add webpack.config.pro.babel.js in current directory'
  );
  if (result === true) {
    copyFileSync(
      path.join(configPath, 'webpack.config.dev.babel.js'),
      currentPath,
    );
  }
  const result = await askQuestion(
    'Are you sure add postcss.config.js in current directory'
  );
  if (result === true) {
    copyFileSync(
      path.join(configPath, 'webpack.config.dev.babel.js'),
      currentPath,
    );
  }
  const result = await askQuestion(
    'Are you sure add babel.config.json in current directory'
  );
  if (result === true) {
    copyFileSync(
      path.join(configPath, 'webpack.config.dev.babel.js'),
      currentPath,
    );
  }
}
