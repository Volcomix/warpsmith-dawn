/// <reference types="@webgpu/types" />

import bindings from "bindings";

const dawn = bindings("dawn");
const gpu: GPU = dawn.createInstance();
console.log(gpu);

const adapter = await gpu.requestAdapter();
console.log(adapter);

if (!adapter) {
  throw new Error("No adapter found");
}

console.log("Info:", adapter.info);
console.log("Limits:", adapter.limits);
console.log("Features:", adapter.features);
