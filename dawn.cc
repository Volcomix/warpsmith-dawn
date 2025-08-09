#include "instance.h"
#include <napi.h>

Napi::Object CreateInstance(const Napi::CallbackInfo &info) {
  return Instance::NewInstance(info.Env());
}

Napi::Object InitAll(Napi::Env env, Napi::Object exports) {
  exports.Set("createInstance", Napi::Function::New(env, CreateInstance));
  Instance::Init(env);
  return exports;
}

NODE_API_MODULE(dawn, InitAll)