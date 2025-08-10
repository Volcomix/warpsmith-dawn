/// <reference types="@webgpu/types" />

import { createRequire } from "node:module";

export type Dawn = {
  createInstance: () => GPU;
};

const dawn: Dawn = createRequire(import.meta.url)("../build/Release/dawn");

export default dawn;
