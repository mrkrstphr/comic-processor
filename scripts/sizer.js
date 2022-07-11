import exifr from 'exifr';
import fs from 'fs/promises';
import path from 'path';
import { ImagePool } from '@squoosh/lib';
import { cpus } from 'os';
import { mkdir, removeRecursive } from '../utils.js';

async function processFiles(inputPath, outputPath) {
  const files = await fs.readdir(inputPath);

  for (const directory of files) {
    const stats = await fs.lstat(path.join(inputPath, directory));
    if (stats.isDirectory()) {
      await processDirectory(path.join(inputPath, directory), outputPath);
      await removeRecursive(path.join(inputPath, directory));
    }
  }
}

async function processDirectory(inputPath, outputPath) {
  const imagePool = new ImagePool(cpus().length);
  const issueOutputPath = path.join(outputPath, path.basename(inputPath));

  console.log(`[sizer] Working on ${inputPath}`);

  await mkdir(issueOutputPath);

  const files = (await fs.readdir(inputPath))
    .filter((file) => file.endsWith('.jpeg') || file.endsWith('.jpg') || file.endsWith('.png'))
    .map((file) => path.join(inputPath, file));

  for (const file of files) {
    const image = imagePool.ingestImage(file);
    const encodeOptions = {
      mozjpeg: {},
    };

    await image.encode(encodeOptions);

    const rawEncodedImage = (await image.encodedWith.mozjpeg).binary;

    await fs.writeFile(path.join(issueOutputPath, path.basename(file)), rawEncodedImage);
  }

  await imagePool.close();
}

export default processFiles;
