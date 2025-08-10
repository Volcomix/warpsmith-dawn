#include "gpu.h"
#include <napi.h>

Napi::Object CreateInstance(const Napi::CallbackInfo &info) {
  return GPU::NewInstance(info.Env());
}

Napi::Object InitAll(Napi::Env env, Napi::Object exports) {
  exports.Set("createInstance", Napi::Function::New(env, CreateInstance));
  GPU::Init(env);
  GPUAdapter::Init(env);
  return exports;
}

NODE_API_MODULE(dawn, InitAll)