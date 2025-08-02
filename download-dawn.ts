import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { ReadableStream } from "node:stream/web";
import { fileURLToPath } from "node:url";

const downloadDir = "downloads";
const repository = "google/dawn";
const platform = "ubuntu-latest-Release";
const envFile = ".env.local";

process.loadEnvFile(envFile);

const githubToken = process.env.GITHUB_TOKEN;
if (!githubToken) {
  throw new Error("GITHUB_TOKEN is not set in the environment variables.");
}

function fetchDawnGitHub(relativeUrl: string) {
  return fetch(`https://api.github.com/repos/${repository}/${relativeUrl}`, {
    headers: { Authorization: `Bearer ${githubToken}` },
  });
}

async function fetchTags() {
  console.log("Fetching Dawn release tags...");
  const response = await fetchDawnGitHub("tags");
  const tags = await response.json();
  console.log(`Found ${tags.length} tags, checking for artifacts...`);
  return tags;
}

async function findArtifactForTag(tag: any) {
  process.stdout.write(`Checking ${tag.name}... `);

  const response = await fetchDawnGitHub(
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
  console.log("Downloading...");
  const response = await fetchDawnGitHub(
    `actions/artifacts/${artifact.id}/zip`
  );

  if (!response.body) {
    throw new Error(`Failed to download artifact: ${response.statusText}`);
  }

  const __dirname = dirname(fileURLToPath(import.meta.url));
  await mkdir(`${__dirname}/${downloadDir}`, { recursive: true });
  await pipeline(
    Readable.fromWeb(response.body as ReadableStream),
    createWriteStream(`${__dirname}/${downloadDir}/${artifact.name}.zip`)
  );

  console.log(`Downloaded: ${artifact.name}.zip`);
}

async function downloadLatestDawnArtifact() {
  const tags = await fetchTags();

  for (const tag of tags) {
    const artifact = await findArtifactForTag(tag);
    if (artifact) {
      await downloadArtifact(artifact);
      break;
    }
  }
}

downloadLatestDawnArtifact();
