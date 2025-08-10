import { mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generateBindingGypi } from "./generators/binding-gypi.ts";
import { generateClass } from "./generators/class.ts";
import { generateEnums } from "./generators/enums.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputDir = join(__dirname, "../src/generated");
const dawnJsonPath = join(__dirname, "../dawn-binaries/dawn.json");

async function cleanGeneratedDirectory() {
  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });
}

async function readDawnJson() {
  const dawnJson = await import(dawnJsonPath, { with: { type: "json" } });
  return dawnJson.default;
}

async function generateDawnBindings() {
  await cleanGeneratedDirectory();

  console.log("Generating Dawn bindings...");
  const dawnJson = await readDawnJson();

  const sources: string[] = [];

  const root = "adapter";
  process.stdout.write(`${root}... `);
  sources.push(await generateClass(root, outputDir));
  console.log("done");

  process.stdout.write("enums... ");
  sources.push(
    await generateEnums(["WGSL language feature name"], dawnJson, outputDir)
  );
  console.log("done");

  process.stdout.write("binding.gypi... ");
  await generateBindingGypi(sources, outputDir);
  console.log("done");
}

generateDawnBindings();
