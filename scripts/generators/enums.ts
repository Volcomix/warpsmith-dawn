import { writeFile } from "node:fs/promises";
import { generateName } from "./name.ts";

function generateFunction(enumName: string) {
  const name = generateName(enumName);
  return `Napi::String Convert${name.pascalCase}(Napi::Env env, wgpu::${name.pascalCase} value)`;
}

async function generateHeader(enumNames: string[], outputDir: string) {
  const name = generateName("enums");

  const functions = enumNames.map(
    (enumName) => generateFunction(enumName) + ";"
  );

  const content = `
#ifndef ${name.includeGuard}
#define ${name.includeGuard}

#include <napi.h>
#include <webgpu/webgpu_cpp.h>

${functions.join("\n")}

#endif // ${name.includeGuard}
  `;

  await writeFile(`${outputDir}/enums.h`, content.trim());
}

async function generateSource(
  enumNames: string[],
  dawnJson: any,
  outputDir: string
) {
  const name = generateName("enums");

  const functions = enumNames.map((enumName) => {
    const name = generateName(enumName);

    return `
${generateFunction(enumName)} {
  switch (value) {
  ${dawnJson[enumName].values
    .filter(({ tags }) => !tags?.includes("dawn"))
    .map(({ name: value, jsrepr }) => {
      value = generateName(value);
      return `
  case wgpu::${name.pascalCase}::${value.pascalCase}:
    return Napi::String::New(env, "${jsrepr.replace(/^'(.*)'$/, "$1")}");
          `.trim();
    })
    .join("\n  ")}
  default:
    return Napi::String::New(env, "");
  }
}
    `.trim();
  });

  const content = `
#include "${name.kebabCase}.h"

${functions.join("\n\n")}
  `;

  const sourceFileName = `${name.kebabCase}.cc`;
  await writeFile(`${outputDir}/${sourceFileName}`, content.trim());
  return sourceFileName;
}

export async function generateEnums(
  enumNames: string[],
  dawnJson: any,
  outputDir: string
) {
  await generateHeader(enumNames, outputDir);
  return await generateSource(enumNames, dawnJson, outputDir);
}
