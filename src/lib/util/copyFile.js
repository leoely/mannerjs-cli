import path from 'path';
import fs from 'fs';

export default function copyFile(name, configPath, currentPath) {
  fs.copyFileSync(path.join(configPath, name), path.join(currentPath, name));
}
