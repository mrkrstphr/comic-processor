import AdmZip from 'adm-zip';
import fs from 'fs/promises';
import path from 'path';
import { exists, mkdir, removeRecursive } from '../utils.js';

async function processFiles(inputPath, outputPath) {
  const files = await fs.readdir(inputPath);

  await Promise.all(
    files
      .filter((file) => file.endsWith('.cbz') || file.endsWith('.zip'))
      .map(async (file) => {
        await processFile(path.join(inputPath, file), outputPath);
        await removeRecursive(path.join(inputPath, file));
      }),
  );
}

function removeFileExtension(filename) {
  return filename.split('.').slice(0, -1).join('.');
}

async function processFile(file, outputPath) {
  if (!(await exists(file))) {
    console.log(` ⛔️ ${file} does not exist`);
    return;
  }

  const basename = path.basename(file);
  const fileOutputDirectory = path.join(outputPath, removeFileExtension(basename));

  await mkdir(fileOutputDirectory);

  let zip;

  try {
    zip = new AdmZip(file);
  } catch (error) {
    console.log(` ⛔️ ${basename} failed to open as a zip file`);
    return;
  }

  const zipEntries = zip.getEntries();

  for (const zipEntry of zipEntries) {
    const filename = zipEntry.entryName;
    const file = zip.readFile(filename);

    await fs.writeFile(path.join(fileOutputDirectory, filename.split('/').slice(-1)[0]), file);
  }
}

export default processFiles;
