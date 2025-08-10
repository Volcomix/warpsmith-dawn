import dawn from "../src/index.ts";

const gpu = dawn.createInstance();
console.log("gpu:", gpu);
console.log("gpu.wgslLanguageFeatures:", gpu.wgslLanguageFeatures);

const adapter = await gpu.requestAdapter();
console.log("adapter:", adapter);

if (!adapter) {
  throw new Error("No adapter found");
}

console.log("adapter.info:", adapter.info);
console.log("adapter.limits:", adapter.limits);
console.log("adapter.features:", adapter.features);
