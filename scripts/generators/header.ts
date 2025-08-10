import { writeFile } from "node:fs/promises";
import { generateName } from "./name.ts";

export async function generateHeader(objectName: string, outputDir: string) {
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
