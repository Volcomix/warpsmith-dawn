import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { ReadableStream } from "node:stream/web";
import { fileURLToPath } from "node:url";

const downloadDir = "downloads";

process.loadEnvFile(".env.local");

const githubToken = process.env.GITHUB_TOKEN;
if (!githubToken) {
  throw new Error("GITHUB_TOKEN is not set in the environment variables.");
}

function fetchDawnGitHub(relativeUrl: string) {
  return fetch(`https://api.github.com/repos/google/dawn/${relativeUrl}`, {
    headers: { Authorization: `Bearer ${githubToken}` },
  });
}

console.log("Fetching Dawn release tags...");
const tagsResponse = await fetchDawnGitHub("tags");
const tags = await tagsResponse.json();

console.log(`Found ${tags.length} tags, checking for artifacts...`);

for (const tag of tags) {
  process.stdout.write(`Checking ${tag.name}... `);

  const artifactsResponse = await fetchDawnGitHub(
    `actions/artifacts?name=Dawn-${tag.commit.sha}-ubuntu-latest-Release`
  );
  const artifacts = await artifactsResponse.json();

  if (artifacts.total_count === 0) {
    console.log("no artifacts");
    continue;
  }

  const artifact = artifacts.artifacts[0];
  const sizeMB = (artifact.size_in_bytes / 1024 / 1024).toFixed(1);
  console.log(`found (${sizeMB} MB)`);

  console.log("Downloading...");
  const archiveResponse = await fetchDawnGitHub(
    `actions/artifacts/${artifact.id}/zip`
  );

  if (!archiveResponse.body) {
    throw new Error(
      `Failed to download artifact: ${archiveResponse.statusText}`
    );
  }

  const __dirname = dirname(fileURLToPath(import.meta.url));
  await mkdir(`${__dirname}/${downloadDir}`, { recursive: true });
  await pipeline(
    Readable.fromWeb(archiveResponse.body as ReadableStream),
    createWriteStream(`${__dirname}/${downloadDir}/${artifact.name}.zip`)
  );

  console.log(`Downloaded: ${artifact.name}.zip`);
  break;
}
