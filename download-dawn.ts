process.loadEnvFile("./.env.local");

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

  break;
}

export {};
