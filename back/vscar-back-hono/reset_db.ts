import { execSync } from 'node:child_process';
import * as os from 'node:os';
import extract from 'extract-zip';
import { type Car, closeConnection, ensureIndexes, getCarsCollection } from './src/db.ts';

async function extractArchive(inputArchive: string, outputDir: string): Promise<void> {
  try {
    execSync(`unzip -o "${inputArchive}" -d "${outputDir}"`, { stdio: 'ignore' });
    console.log('Extracted using native unzip');
  } catch {
    await extract(inputArchive, { dir: outputDir });
  }
}

async function loadJsonToDb(path: string): Promise<void> {
  console.log(`Loading ${path} to db`);

  const collection = await getCarsCollection();
  await collection.dropIndexes().catch(() => undefined);

  const deleted = await collection.deleteMany({});
  console.log('Removed:', deleted);

  // The seed file's shape is guaranteed by db/db.zip's export format, not statically known here.
  const json = JSON.parse(await Deno.readTextFile(path)) as unknown as Car[];
  const inserted = await collection.insertMany(json);
  console.log('Added:', inserted.insertedCount);

  await ensureIndexes();
  console.log('Indices ensured.');

  await closeConnection();
}

async function main(): Promise<void> {
  const inputArchive = '../../db/db.zip';
  const outputDir = os.tmpdir();

  try {
    console.log(`Extracting ${inputArchive} to ${outputDir}`);
    await extractArchive(inputArchive, outputDir);
    console.log('Done\n');
  } catch (err) {
    console.log(err);
  }

  await loadJsonToDb(`${outputDir}/car.json`);
}

await main();
