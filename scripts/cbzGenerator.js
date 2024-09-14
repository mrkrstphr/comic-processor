import AdmZip from 'adm-zip';
import fs from 'fs/promises';
import path from 'path';
import { log, removeRecursive } from '../utils.js';

const allowedExtensions = ['.jpeg', '.jpg', '.png', '.webp'];

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
  log('cbz-generator', `Working on ${inputPath}... `);

  const issueOutputPath = `${path.join(outputPath, path.basename(inputPath))}.cbz`;
  const outputFile = new AdmZip();

  const files = (await fs.readdir(inputPath))
    .filter((file) => allowedExtensions.includes[path.extname(file)])
    .map((file) => path.join(inputPath, file));

  for (const file of files) {
    outputFile.addFile(path.basename(file), await fs.readFile(file));
  }

  outputFile.writeZip(issueOutputPath);

  process.stdout.write('DONE.\n');
}

export default processFiles;
