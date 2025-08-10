export function generateName(objectName: string) {
  const parts = objectName.split(" ");
  const file = parts.join("-");
  const includeGuard = parts.join("_").toUpperCase() + "_H";

  const dawnClass = parts
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("");

  const webgpuClass = `GPU${dawnClass}`;
  const delegate = dawnClass[0].toLowerCase() + dawnClass.slice(1);

  return { file, includeGuard, dawnClass, webgpuClass, delegate };
}
