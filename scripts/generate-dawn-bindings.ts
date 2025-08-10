import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputDir = join(__dirname, "../src/generated");

async function cleanGeneratedDirectory() {
  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });
}

async function generateHeaderFile(objectName: string) {
  const nameParts = objectName.split(" ");
  const fileName = nameParts.join("-");
  const includeGuardName = nameParts.join("_").toUpperCase() + "_H";

  const dawnClassName = nameParts
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("");

  const webgpuClassName = `GPU${dawnClassName}`;
  const delegateName = dawnClassName[0].toLowerCase() + dawnClassName.slice(1);

  const content = `
#ifndef ${includeGuardName}
#define ${includeGuardName}

#include <napi.h>
#include <webgpu/webgpu_cpp.h>

class ${webgpuClassName} : public Napi::ObjectWrap<${webgpuClassName}> {
public:
  static void Init(Napi::Env env);
  static Napi::Object NewInstance(Napi::Env env, wgpu::${dawnClassName} *${delegateName});
  ${webgpuClassName}(const Napi::CallbackInfo &info);

private:
  static Napi::FunctionReference constructor;
  wgpu::${dawnClassName} *${delegateName};
};

#endif // ${includeGuardName}
  `;

  await writeFile(`${outputDir}/${fileName}.h`, content.trim());
}

async function generateSourceFile(objectName: string) {
  const nameParts = objectName.split(" ");
  const fileName = nameParts.join("-");

  const dawnClassName = nameParts
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("");

  const webgpuClassName = `GPU${dawnClassName}`;
  const delegateName = dawnClassName[0].toLowerCase() + dawnClassName.slice(1);

  const content = `
#include "${fileName}.h"

Napi::FunctionReference ${webgpuClassName}::constructor;

void ${webgpuClassName}::Init(Napi::Env env) {
  Napi::Function func = DefineClass(env, "${webgpuClassName}", {});

  constructor = Napi::Persistent(func);
  constructor.SuppressDestruct();
}

${webgpuClassName}::${webgpuClassName}(const Napi::CallbackInfo &info)
    : Napi::ObjectWrap<${webgpuClassName}>(info) {
  this->${delegateName} = info[0].As<Napi::External<wgpu::${dawnClassName}>>().Data();
}

Napi::Object ${webgpuClassName}::NewInstance(Napi::Env env, wgpu::${dawnClassName} *${delegateName}) {
  return constructor.New({Napi::External<wgpu::${dawnClassName}>::New(env, ${delegateName})});
}
  `;

  await writeFile(`${outputDir}/${fileName}.cc`, content.trim());
}

async function generateBindingGypi(sources: string[]) {
  const content = `
{
    "sources": [
${sources.map((source) => `        "${source}.cc",`).join("\n")}
    ]
}
  `;

  await writeFile(`${outputDir}/binding.gypi`, content.trim() + "\n");
}

async function generateDawnBindings() {
  await cleanGeneratedDirectory();

  console.log("Generating Dawn bindings...");

  const root = "adapter";
  process.stdout.write(`${root}... `);
  await generateHeaderFile(root);
  await generateSourceFile(root);
  await generateBindingGypi([root]);
  console.log("done");
}

generateDawnBindings();
