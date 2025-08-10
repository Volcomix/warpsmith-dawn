import { writeFile } from "node:fs/promises";

export async function generateBindingGypi(
  sources: string[],
  outputDir: string
) {
  const content = `
{
    "sources": [
${sources.map((source) => `        "${source}",`).join("\n")}
    ]
}
  `;

  await writeFile(`${outputDir}/binding.gypi`, content.trim() + "\n");
}
