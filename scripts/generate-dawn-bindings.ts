import { mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generateBindingGypi } from "./generators/binding-gypi.ts";
import { generateHeader } from "./generators/header.ts";
import { generateSource } from "./generators/source.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputDir = join(__dirname, "../src/generated");

async function cleanGeneratedDirectory() {
  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });
}

async function generateDawnBindings() {
  await cleanGeneratedDirectory();

  console.log("Generating Dawn bindings...");

  const root = "adapter";
  process.stdout.write(`${root}... `);
  await generateHeader(root, outputDir);
  const sourceFileName = await generateSource(root, outputDir);
  await generateBindingGypi([sourceFileName], outputDir);
  console.log("done");
}

generateDawnBindings();
