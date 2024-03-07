import { cpSync, } from 'fs';
import path from 'path';
import askQuestion from '~/lib/util/askQuestion';

export default async function dir(...param) {
  const currentPath = path.resolve('.');
  let result = await askQuestion(
    'Are you sure add standard "src/" in current directory'
  );
  const templatePath = path.resolve(
    __dirname, '..', '..', '..', 'asset', 'template'
  );
  if (result === true) {
    cpSync(templatePath, path.join(currentPath, 'src'), {
      recursive: true,
    });
  }
}
