import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import askQuestion from '~/lib/util/askQuestion';

export default async function script(...param) {
  const currentPath = path.resolve('.');
  const result = await askQuestion(
    'Are you sure add standard ' + chalk.blue('"scripts"') + ' to package.json.'
  );
  const packageJsonPath = path.join(currentPath, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const string = fs.readFileSync(packageJsonPath).toString();
    const packageConfig = JSON.parse(string);
    packageConfig['scripts'] = {
      lint: "eslint ./src",
      build: "gulp build",
      start: "yarn run build && node dist/index.js",
      dev: "webpack serve --config webpack.config.dev.js",
      pro: "webpack --config webpack.config.pro.js",
    };
    const fd = fs.openSync(packageJsonPath, 'r+');
    fs.writeFileSync(fd, JSON.stringify(packageConfig, null, '  '));
  } else {
    console.log(chalk.bold('Current project package.json don\'t exist.'));
  }
}
