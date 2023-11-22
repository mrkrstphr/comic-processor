import fs from 'fs/promises';
import path from 'path';

export async function exists(path) {
  try {
    await fs.access(path);
    return true;
  } catch (e) {
    if (e.code === 'ENOENT') {
      return false;
    }

    throw e;
  }
}

export async function removeRecursive(path) {
  if (await exists(path)) {
    await fs.rm(path, { recursive: true });
  }
}

export async function processFiles(inputPath, outputPath) {
  const files = await fs.readdir(inputPath);

  for (const directory of files) {
    const stats = await fs.lstat(path.join(inputPath, directory));
    if (stats.isDirectory()) {
      await processDirectory(path.join(inputPath, directory), outputPath);
      await removeDirectory(path.join(inputPath, directory));
    }
  }
}

export async function mkdir(dir) {
  try {
    await fs.mkdir(dir);
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err;
    }
  }
}

export function pidIsRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return false;
  }
}

export function log(util, message) {
  process.stdout.write(`[${util}] ${message}`);
}
