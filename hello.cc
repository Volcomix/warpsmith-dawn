#include <napi.h>
#include <webgpu/webgpu_cpp.h>

Napi::String Method(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  wgpu::CreateInstance();
  return Napi::String::New(env, "world");
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set(Napi::String::New(env, "hello"),
              Napi::Function::New(env, Method));
  return exports;
}

NODE_API_MODULE(hello, Init)