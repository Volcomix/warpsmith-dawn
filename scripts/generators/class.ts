import { writeFile } from "node:fs/promises";
import { generateName } from "./name.ts";

async function generateHeader(objectName: string, outputDir: string) {
  const name = generateName(objectName);

  const content = `
#ifndef ${name.includeGuard}
#define ${name.includeGuard}

#include <napi.h>
#include <webgpu/webgpu_cpp.h>

class ${name.webgpuClass} : public Napi::ObjectWrap<${name.webgpuClass}> {
public:
  static void Init(Napi::Env env);
  static Napi::Object NewInstance(Napi::Env env, wgpu::${name.pascalCase} *${name.camelCase});
  ${name.webgpuClass}(const Napi::CallbackInfo &info);

private:
  static Napi::FunctionReference constructor;
  wgpu::${name.pascalCase} *${name.camelCase};
};

#endif // ${name.includeGuard}
  `;

  await writeFile(`${outputDir}/${name.kebabCase}.h`, content.trim());
}

async function generateSource(objectName: string, outputDir: string) {
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

export async function generateClass(objectName: string, outputDir: string) {
  await generateHeader(objectName, outputDir);
  return await generateSource(objectName, outputDir);
}
