import { writeFile } from "node:fs/promises";
import { generateName } from "./name.ts";

async function generateHeader(
  objectName: string,
  dawnJson: any,
  outputDir: string
) {
  const name = generateName(objectName);

  let getters = dawnJson[objectName].methods
    .filter(
      ({ name, tags }) => name.startsWith("get ") && !tags?.includes("dawn")
    )
    .map(({ name, args }) => {
      const getterName = name.replace(/^get /, "");
      const returnTypeName = args[0].type;
      const returnTypeJson = dawnJson[returnTypeName];
      if (returnTypeJson.category === "structure") {
        if (
          returnTypeJson.members.length === 2 &&
          returnTypeJson.members[1].annotation === "const*" &&
          returnTypeJson.members[1].length
        ) {
          return {
            getterName,
            returnTypeName,
            returnType: `readonly set of: ${returnTypeJson.members[1].type}`,
          };
        } else {
          return {
            getterName,
            returnTypeName,
            members: returnTypeJson.members
              .filter(
                (member: any) => !dawnJson[member.type].emscripten_no_enum_table
              )
              .map(({ name, type }) => `${name}: ${type}`),
          };
        }
      } else {
        throw new Error(
          `Unsupported return type for getter ${getterName}: ${returnTypeName}`
        );
      }
    });

  console.log(getters);

  getters = getters.map((getter) => {
    const name = generateName(getter.getterName);
    return `Napi::Value Get${name.pascalCase}(const Napi::CallbackInfo &info);`;
  });

  const content = `
#ifndef ${name.includeGuard}
#define ${name.includeGuard}

#include <napi.h>
#include <webgpu/webgpu_cpp.h>

class ${name.webgpuClass} : public Napi::ObjectWrap<${name.webgpuClass}> {
public:
  static void Init(Napi::Env env);
  static Napi::Object NewInstance(Napi::Env env, wgpu::${name.pascalCase} *${
    name.camelCase
  });
  ${name.webgpuClass}(const Napi::CallbackInfo &info);

private:
  static Napi::FunctionReference constructor;
  wgpu::${name.pascalCase} *${name.camelCase};
  ${getters.join("\n  ")}
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

export async function generateClass(
  objectName: string,
  dawnJson: any,
  outputDir: string
) {
  await generateHeader(objectName, dawnJson, outputDir);
  return await generateSource(objectName, outputDir);
}
