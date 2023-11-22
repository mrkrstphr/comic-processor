import AdmZip from 'adm-zip';
import fs from 'fs/promises';
import path from 'path';
import { exists, log, mkdir, removeRecursive } from '../utils.js';

async function processFiles(inputPath, outputPath) {
  const files = (await fs.readdir(inputPath)).filter((file) => file.endsWith('.epub'));

  for (const file of files) {
    await processFile(path.join(inputPath, file), outputPath);
    await removeRecursive(path.join(inputPath, file));
  }
}

function removeFileExtension(filename) {
  return filename.split('.').slice(0, -1).join('.');
}

async function processFile(file, outputPath) {
  log(`[epub-extractor] Working on ${file}... `);

  if (!(await exists(file))) {
    log(` file does not exist!\n`);
    return;
  }

  const basename = path.basename(file);

  const fileOutputDirectory = path.join(outputPath, removeFileExtension(basename));

  if (!(await exists(fileOutputDirectory))) {
    await mkdir(fileOutputDirectory);
  }

  let zip;

  try {
    zip = new AdmZip(file);
  } catch (error) {
    log(` failed to open as a zip file!\n`);
    return;
  }

  const zipEntries = zip.getEntries();

  for (const zipEntry of zipEntries) {
    const filename = zipEntry.entryName;

    // We're assuming here that the only images in the epub will be the pages themselves
    if (filename.endsWith('.png') || filename.endsWith('.jpg') || filename.endsWith('.jpeg')) {
      const baseNameWithoutExtension = path.basename(filename).split('.').slice(0, -1).join('.');
      const baseNameJustNumbers = baseNameWithoutExtension.replace(/\D/g, '');
      const extension = filename.split('.').slice(-1)[0];
      const renamedFile = `${baseNameJustNumbers.padStart(3, '0')}.${extension}`;

      await fs.writeFile(path.join(fileOutputDirectory, renamedFile), zip.readFile(filename));
    }
  }

  process.stdout.write(` DONE.\n`);
}

export default processFiles;
