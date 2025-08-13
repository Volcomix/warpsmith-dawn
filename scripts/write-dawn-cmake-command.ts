import { writeFile } from "node:fs/promises";
import { argv } from "node:process";

if (!argv[2]) {
  throw new Error(
    "Destination file argument is required. Usage: node write-dawn-cmake-command.js <destination>"
  );
}

async function fetchBuildId(): Promise<string> {
  const response = await fetch(
    "https://cr-buildbucket.appspot.com/prpc/buildbucket.v2.Builds/SearchBuilds",
    {
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        predicate: {
          builder: { project: "dawn", bucket: "ci", builder: "cmake-mac-rel" },
          status: "SUCCESS",
        },
        fields: "builds.*.id",
        pageSize: 1,
      }),
      method: "POST",
    }
  );
  const text = await response.text();
  const { builds } = JSON.parse(text.trim().split("\n").pop()!);

  if (!builds?.length || !builds[0]?.id) {
    throw new Error("No build ID found in response");
  }
  return builds[0].id;
}

async function fetchExecutionDetails(buildId: string): Promise<string> {
  const response = await fetch(
    `https://logs.chromium.org/logs/dawn/buildbucket/cr-buildbucket/${buildId}/+/u/CMake_build_default_targets/CMake_generate_step_for_default_targets/l_execution_details?format=raw`
  );
  return await response.text();
}

function extractCMakeCommand(detailsText: string): string[] {
  const match = detailsText.match(/Executing command (\[[^\]]*\])/);
  if (!match) {
    throw new Error(
      "Could not find 'Executing command [...]' in execution details."
    );
  }
  const command = new Function(`return ${match[1]}`)();
  return [
    "cmake",
    "-S",
    ".",
    "-B",
    "out/Release",
    "-DDAWN_FETCH_DEPENDENCIES=ON",
    ...command.slice(5).map((arg: string) => arg.replace(/\.\.\/src/, "src")),
  ];
}

async function main() {
  const destination = argv[2];
  const buildId = await fetchBuildId();
  console.log(`Found build ID: ${buildId}`);
  const detailsText = await fetchExecutionDetails(buildId);
  let cmakeCommand: string[];
  try {
    cmakeCommand = extractCMakeCommand(detailsText);
  } catch (err) {
    console.error(
      "Failed to parse execution command. Execution details text:",
      detailsText
    );
    throw err;
  }
  console.log("CMake command:", cmakeCommand);
  await writeFile(destination, cmakeCommand.join(" "));
}

main();
