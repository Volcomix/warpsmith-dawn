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

const tagsResponse = await fetchDawnGitHub("tags");
const tags = await tagsResponse.json();

for (const tag of tags) {
  console.log(`Processing tag: ${tag.name} (${tag.commit.sha})`);

  const artifactsResponse = await fetchDawnGitHub(
    `actions/artifacts?name=Dawn-${tag.commit.sha}-ubuntu-latest-Release`
  );
  const artifacts = await artifactsResponse.json();

  if (artifacts.total_count === 0) {
    console.warn(`No artifacts found for tag ${tag.name}`);
    continue;
  }

  const artifact = artifacts.artifacts[0];
  console.log(
    `Found artifact: ${artifact.name} (${artifact.size_in_bytes} bytes)`
  );

  const archiveResponse = await fetchDawnGitHub(
    `actions/artifacts/${artifact.id}/zip`
  );

  if (!archiveResponse.body) {
    throw new Error(
      `Failed to download artifact ${artifact.name}: ${archiveResponse.statusText}`
    );
  }

  console.log(`Downloading artifact ${artifact.name}...`);
  const __dirname = dirname(fileURLToPath(import.meta.url));
  await mkdir(`${__dirname}/${downloadDir}`, { recursive: true });
  await pipeline(
    Readable.fromWeb(archiveResponse.body as ReadableStream),
    createWriteStream(`${__dirname}/${downloadDir}/${artifact.name}.zip`)
  );

  break;
}
