export function generateName(name: string) {
  const parts = name.split(" ");

  const pascalCase = parts
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("");

  const camelCase = pascalCase[0].toLowerCase() + pascalCase.slice(1);
  const kebabCase = parts.join("-");

  const includeGuard = parts.join("_").toUpperCase() + "_H";
  const webgpuClass = `GPU${pascalCase}`;

  return { kebabCase, pascalCase, camelCase, includeGuard, webgpuClass };
}
