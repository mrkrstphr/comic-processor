import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { log, mkdir, removeRecursive } from '../utils.js';

async function processFiles(inputPath, outputPath) {
  const files = await fs.readdir(inputPath);

  for (const directory of files) {
    const stats = await fs.lstat(path.join(inputPath, directory));
    if (stats.isDirectory()) {
      if (await processDirectory(path.join(inputPath, directory), outputPath)) {
        await removeRecursive(path.join(inputPath, directory));
      }
    }
  }
}

async function processDirectory(inputPath, outputPath) {
  const issueOutputPath = path.join(outputPath, path.basename(inputPath));

  log('sizer', `Working on ${path.basename(inputPath)}... `);

  await mkdir(issueOutputPath);

  const files = (await fs.readdir(inputPath))
    .filter((file) => file.endsWith('.jpeg') || file.endsWith('.jpg') || file.endsWith('.png'))
    .map((file) => path.join(inputPath, file));

  for (const file of files) {
    if (path.basename(file).startsWith('.')) continue;

    try {
      await sharp(file)
        .jpeg({ mozjpeg: true })
        .toFile(path.join(issueOutputPath, path.basename(file)));
    } catch (e) {
      process.stdout.write('ERROR!\n');
      log('sizer', `Error: ${e}\n`);
      log('sizer', `Error file = [${file}]\n`);

      await removeRecursive(issueOutputPath);

      return false;
    }
  }

  process.stdout.write('DONE.\n');

  return true;
}

export default processFiles;
