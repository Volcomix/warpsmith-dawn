/// <reference types="@webgpu/types" />

import bindings from "bindings";

const dawn = bindings("dawn");
const gpu: GPU = dawn.createInstance();
console.log(gpu);

const adapter = await gpu.requestAdapter();
