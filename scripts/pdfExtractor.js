import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { exists, log, mkdir, removeRecursive } from '../utils.js';

async function processFiles(inputPath, outputPath) {
  const files = (await fs.readdir(inputPath)).filter((file) => file.endsWith('.pdf'));

  for (const file of files) {
    if (await processFile(path.join(inputPath, file), outputPath)) {
      await removeRecursive(path.join(inputPath, file));
    }
  }
}

function removeFileExtension(filename) {
  return filename.split('.').slice(0, -1).join('.');
}

async function processFile(inputPath, outputPath) {
  log('pdf-extractor', `Working on ${inputPath}... `);

  if (!(await exists(inputPath))) {
    console.log('SKIPPING; does not exist...');
    return;
  }

  const basename = path.basename(inputPath);
  const fileOutputDirectory = path.join(outputPath, removeFileExtension(basename));

  if (!(await exists(fileOutputDirectory))) {
    await mkdir(fileOutputDirectory);
  }

  try {
    await new Promise((resolve, reject) => {
      const child = spawn('convert', [
        '-density',
        '300',
        inputPath,
        '-quality',
        '100',
        path.join(fileOutputDirectory, 'page.jpg'),
      ]);

      child.on('close', (code) => {
        if (code === 0) return resolve();

        reject();
      });
    });
  } catch (error) {
    console.log('FAILED');
    log('pdf-extractor', `Failed to extract pdf: ${inputPath}`);

    return false;
  }

  console.log('DONE');
  return true;
}

export default processFiles;
