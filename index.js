import fs from 'fs/promises';
import path from 'path';
import cbzGenerator from './scripts/cbzGenerator.js';
import epubExtractor from './scripts/epubExtractor.js';
import sizer from './scripts/sizer.js';
import zipExtractor from './scripts/zipExtractor.js';
import { exists, pidIsRunning } from './utils.js';

if (await exists(path.join(process.cwd(), 'app.pid'))) {
  if (pidIsRunning(await fs.readFile(path.join(process.cwd(), 'app.pid')))) {
    console.warn('Running process found; exiting...');
    process.exit();
  } else {
    await fs.unlink(path.join(process.cwd(), 'app.pid'));
  }
}

await fs.writeFile('app.pid', process.pid.toString());

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');

await epubExtractor(path.join(dataDir, 'epub'), path.join(dataDir, 'folder'));
// await pdfExtractor(path.join(dataDir, 'pdf'), path.join(dataDir, 'folder'));
await zipExtractor(path.join(dataDir, 'zip'), path.join(dataDir, 'folder'));
await cbzGenerator(path.join(dataDir, 'cbz'), path.join(dataDir, 'done'));
await sizer(path.join(dataDir, 'sizer'), path.join(dataDir, 'cbz'));

await fs.unlink(path.join(process.cwd(), 'app.pid'));
