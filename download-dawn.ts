import { createWriteStream } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { ReadableStream } from "node:stream/web";
import { fileURLToPath } from "node:url";

const downloadDir = "downloads";
const repository = "google/dawn";
const platform = "ubuntu-latest-Release";
const envFile = ".env.local";

const __dirname = dirname(fileURLToPath(import.meta.url));

process.loadEnvFile(envFile);

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

async function findArtifactForTag(tag: any) {
  process.stdout.write(`Checking ${tag.name}... `);

  const response = await fetchFromDawnRepo(
    `actions/artifacts?name=Dawn-${tag.commit.sha}-${platform}`
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
    createWriteStream(`${__dirname}/${downloadDir}/${artifact.name}.zip`)
  );

  console.log(`Downloaded: ${artifact.name}.zip`);
}

async function downloadDawnJson(tag: any) {
  const response = await fetchFromDawnRepo(
    `contents/src/dawn/dawn.json?ref=${tag.commit.sha}`
  );
  const dawnJson = await response.json();
  const content = Buffer.from(dawnJson.content, "base64");
  await writeFile(`${__dirname}/${downloadDir}/dawn.json`, content);
  console.log("Downloaded: dawn.json");
}

async function downloadLatestDawn() {
  const tags = await fetchTags();

  for (const tag of tags) {
    const artifact = await findArtifactForTag(tag);
    if (artifact) {
      console.log("Downloading...");
      await mkdir(`${__dirname}/${downloadDir}`, { recursive: true });
      await Promise.all([downloadArtifact(artifact), downloadDawnJson(tag)]);
      break;
    }
  }
}

downloadLatestDawn();
