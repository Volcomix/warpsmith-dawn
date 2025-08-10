import dawn from "../src/index.ts";

const gpu = dawn.createInstance();
console.log(gpu);

const adapter = await gpu.requestAdapter();
console.log(adapter);

if (!adapter) {
  throw new Error("No adapter found");
}

console.log("Info:", adapter.info);
console.log("Limits:", adapter.limits);
console.log("Features:", adapter.features);
