import childProcess from 'child_process';
import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import Fulmination from 'fulmination';
import {
  checkVersion,
  askQuestion,
  emphasis,
  tick,
  cross,
  greaterOrEqualVersion,
  checkDependencies,
} from 'mien';

const fulmination = new Fulmination();

async function replaceRecursion(relativePath, srcPath, tmplPath) {
  const dir = fs.opendirSync(path.resolve(tmplPath, relativePath));
  for await (let dirent of dir) {
    const { name, } = dirent;
    if (name === '.gitkeep') {
      break;
    }
    if (dirent.isDirectory()) {
      await replaceRecursion(path.join(relativePath, name), srcPath, tmplPath);
    } else {
      await replaceFile(path.join(srcPath, relativePath), path.join(tmplPath, relativePath), name);
    }
  }
}

async function replaceFile(originPath, laterPath, name, rename) {
  let originLocation;
  if (typeof rename === 'string') {
    originLocation = path.join(originPath, rename);
  } else {
    originLocation = path.join(originPath, name);
  }
  const answer = await askQuestion('(+) bold: Are you sure to update the specified' + emphasis(originLocation) + '(+):.');
  if (answer === true) {
    if (fs.existsSync(originLocation)) {
      fs.rmSync(originLocation);
    }
    if (typeof rename === 'string') {
      fs.cpSync(path.join(laterPath, name), path.join(originPath, rename));
    } else {
      fs.cpSync(path.join(laterPath, name), path.join(originPath, name));
    }
    fulmination.scan(tick() + '(+) bold: File ' + emphasis(originLocation) + '(+) bold: * updated successfully. &');
  } else {
    fulmination.scan(cross() + '(+) bold: File ' + emphasis(originLocation) + '(+) bold: * update canceled. &');
  }
}

function installDevDep(dep) {
  childProcess.execSync('yarn add --dev ' + dep, { stdio: 'inherit', });
  fulmination.scan(tick() + '(+) bold: Development dependency ' + emphasis(dep) + '(+) bold: * installation is successful. &');
}

function installDep(dep) {
  childProcess.execSync('yarn add ' + dep, { stdio: 'inherit', });
  fulmination.scan(tick() + '(+) bold: Dependency ' + emphasis(dep) + '(+) bold: * installation is successful. &');
}

export default async function update(...param) {
  checkVersion('v21.6.2');
  await checkDependencies(['yarn', 'git']);
  const currentPath = path.resolve('.');
  const mannerPath = path.join(currentPath, '.manner');
  const versionPath = path.join(mannerPath, 'version');
  if (!fs.existsSync(versionPath)) {
    fulmination.scan(cross() + '(+) bold: The current project is not a' + emphasis('manner') + ' (+) bold: * project. &');
    return;
  }
  const version1 = fs.readFileSync(versionPath).toString();
  const modulePath = path.resolve(__dirname, '..', '..', '..');
  const modulePackageJSON = fs.readFileSync(path.join(modulePath, 'package.json')).toString();
  const modulePackageData = JSON.parse(modulePackageJSON);
  const { version: version2, } = modulePackageData;
  if (greaterOrEqualVersion(version1, version2)) {
    fulmination.scan(cross() + '(+) bold: The current ' + emphasis('version') + ' (+) bold: * is already the latest and does not to be updated. &');
    return;
  }
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
  if (needEslint === true) {
    installDevDep('@eslint/css');
    installDevDep('@eslint/js');
    installDevDep('@eslint/json');
    installDevDep('@eslint/markdown');
    installDevDep('eslint');
    installDevDep('eslint-plugin-react');
  }
  if (needTailwind === true) {
    installDep('@tailwindcss/postcss');
    installDep('tailwindcss')
  }
  if (needMui === true) {
    installDep('@emotion/react');
    installDep('@emotion/styled');
    installDep('@mui/material');
  }
  const assetPath = path.join(modulePath, 'asset');
  const configPath = path.join(assetPath, 'config');
  const nodes = fs.readdirSync(configPath);
  const needNodes = [];
  for (let i = 0; i < nodes.length; i += 1) {
    const node = nodes[i];
    if (node.startsWith('%')) {
      switch (node) {
        case '%.gitignore':
          if (needGit === true) {
            needNodes.push('.gitignore');
          }
          break;
        case '%postcss@tailwind':
          break;
      }
    } else {
      switch (node) {
        case '.eslintignore':
        case '.eslintrc':
        case 'eslint.config.mjs':
          if (needEslint === true) {
            needNodes.push(node);
          }
          break;
        case '.gitattributes':
          if (needGit === true) {
            needNodes.push(node);
          }
          break;
        default:
          needNodes.push(node);
      }
    }
  }
  for (let i = 0; i < needNodes.length; i += 1) {
    const node = needNodes[i];
    switch (node) {
      case 'postcss.config.js':
        switch (needTailwind) {
          case true:
            await replaceFile(currentPath, configPath, '%postcss@tailwind.config.js', node);
            break;
          case false:
            await replaceFile(currentPath, configPath, node);
            break;
        }
        break;
      case '.gitignore':
        await replaceFile(currentPath, configPath, '%.gitignore', node);
        break;
      default:
        await replaceFile(currentPath, configPath, node);
    }
  }
  const imgPath = path.join(assetPath, 'img');
  await replaceFile(path.join(currentPath, 'asset'), imgPath, 'favicon.png');
  const tmplPath = path.join(assetPath, 'tmpl');
  const srcPath = path.join(currentPath, 'src');
  await replaceRecursion('.', srcPath, tmplPath);
  fs.writeFileSync(versionPath, version2);
  fulmination.scan(tick() + '(+) bold: The' + emphasis('version') + '(+) bold: * information updated completed. &');
  fulmination.scan(tick() + '(+) bold: The overall project' + emphasis('manner') + '(+) bold: * updated was successfully. &');
}
