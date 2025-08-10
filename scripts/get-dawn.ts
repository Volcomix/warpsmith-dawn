import child_process from "node:child_process";
import { createWriteStream } from "node:fs";
import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { ReadableStream } from "node:stream/web";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const exec = promisify(child_process.exec);
const __dirname = dirname(fileURLToPath(import.meta.url));

const repository = "google/dawn";
const dawnBinariesDir = join(__dirname, "../dawn-binaries");

process.loadEnvFile(".env.local");

const githubToken = process.env.GITHUB_TOKEN;
if (!githubToken) {
  throw new Error("GITHUB_TOKEN is not set in the environment variables.");
}

function fetchFromDawnRepo(relativeUrl: string) {
  return fetch(`https://api.github.com/repos/${repository}/${relativeUrl}`, {
    headers: { Authorization: `Bearer ${githubToken}` },
  });
}

async function fetchTags() {
  console.log("Fetching Dawn release tags...");
  const response = await fetchFromDawnRepo("tags");
  const tags = await response.json();
  console.log(`Found ${tags.length} tags, checking for artifacts...`);
  return tags;
}

function getPlatform() {
  switch (process.platform) {
    case "win32":
      return "windows-latest";
    case "linux":
      return "ubuntu-latest";
    case "darwin":
      switch (process.arch) {
        case "arm64":
          return "macos-latest";
        case "x64":
          return "macos-13";
        default:
          throw new Error(`Unsupported architecture: ${process.arch}`);
      }
    default:
      throw new Error(`Unsupported platform: ${process.platform}`);
  }
}

async function findArtifactForTag(tag: any) {
  process.stdout.write(`Checking ${tag.name}... `);

  const response = await fetchFromDawnRepo(
    `actions/artifacts?name=Dawn-${tag.commit.sha}-${getPlatform()}-Release`
  );
  const artifacts = await response.json();

  if (artifacts.total_count === 0) {
    console.log("no artifacts");
    return null;
  }

  const artifact = artifacts.artifacts[0];
  const sizeMB = (artifact.size_in_bytes / 1024 / 1024).toFixed(1);
  console.log(`found (${sizeMB} MB)`);
  return artifact;
}

async function downloadArtifact(artifact: any) {
  const response = await fetchFromDawnRepo(
    `actions/artifacts/${artifact.id}/zip`
  );

  if (!response.body) {
    throw new Error(`Failed to download artifact: ${response.statusText}`);
  }

  await pipeline(
    Readable.fromWeb(response.body as ReadableStream),
    createWriteStream(`${dawnBinariesDir}/${artifact.name}.zip`)
  );

  console.log(`Downloaded: ${artifact.name}.zip`);
}

async function downloadDawnJson(tag: any) {
  const response = await fetchFromDawnRepo(
    `contents/src/dawn/dawn.json?ref=${tag.commit.sha}`
  );
  const dawnJson = await response.json();
  const content = Buffer.from(dawnJson.content, "base64");
  await writeFile(`${dawnBinariesDir}/dawn.json`, content);
  console.log("Downloaded: dawn.json");
}

async function extractBinaries(artifact: any) {
  const artifactPath = `${dawnBinariesDir}/${artifact.name}`;
  const zipPath = `${artifactPath}.zip`;
  const tarGzPath = `${artifactPath}.tar.gz`;

  console.log(`Unzipping...`);
  await exec(`unzip -o ${zipPath} -d ${dawnBinariesDir}`);

  console.log("Extracting tar.gz...");
  await exec(`tar -xzf ${tarGzPath} -C ${dawnBinariesDir}`);

  console.log("Copying files...");
  await cp(artifactPath, `${dawnBinariesDir}`, {
    recursive: true,
    force: true,
  });

  console.log("Cleaning up...");
  await Promise.all([
    rm(zipPath, { force: true }),
    rm(tarGzPath, { force: true }),
    rm(artifactPath, { recursive: true, force: true }),
  ]);

  console.log(`Extracted to: ${dawnBinariesDir}`);
}

async function setupDawnBinaries() {
  const tags = await fetchTags();

  for (const tag of tags) {
    const artifact = await findArtifactForTag(tag);
    if (artifact) {
      console.log("Downloading...");
      await mkdir(`${dawnBinariesDir}`, { recursive: true });
      await Promise.all([
        downloadArtifact(artifact).then(() => extractBinaries(artifact)),
        downloadDawnJson(tag),
      ]);
      break;
    }
  }
}

setupDawnBinaries();
