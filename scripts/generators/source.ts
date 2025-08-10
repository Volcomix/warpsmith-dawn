import { writeFile } from "node:fs/promises";
import { generateName } from "./name.ts";

export async function generateSource(objectName: string, outputDir: string) {
  const name = generateName(objectName);

  const content = `
#include "${name.kebabCase}.h"

Napi::FunctionReference ${name.webgpuClass}::constructor;

void ${name.webgpuClass}::Init(Napi::Env env) {
  Napi::Function func = DefineClass(env, "${name.webgpuClass}", {});

  constructor = Napi::Persistent(func);
  constructor.SuppressDestruct();
}

${name.webgpuClass}::${name.webgpuClass}(const Napi::CallbackInfo &info)
    : Napi::ObjectWrap<${name.webgpuClass}>(info) {
  this->${name.camelCase} = info[0].As<Napi::External<wgpu::${name.pascalCase}>>().Data();
}

Napi::Object ${name.webgpuClass}::NewInstance(Napi::Env env, wgpu::${name.pascalCase} *${name.camelCase}) {
  return constructor.New({Napi::External<wgpu::${name.pascalCase}>::New(env, ${name.camelCase})});
}
  `;

  const sourceFileName = `${name.kebabCase}.cc`;
  await writeFile(`${outputDir}/${sourceFileName}`, content.trim());
  return sourceFileName;
}
