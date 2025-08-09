#include "gpu.h"
#include <iostream>

void GPU::Init(Napi::Env env) {
  Napi::Function func = DefineClass(
      env, "GPU", {InstanceMethod("requestAdapter", &GPU::RequestAdapter)});

  Napi::FunctionReference *constructor = new Napi::FunctionReference();
  *constructor = Napi::Persistent(func);
  env.SetInstanceData(constructor);
}

GPU::GPU(const Napi::CallbackInfo &info) : Napi::ObjectWrap<GPU>(info) {
  this->instance = wgpu::CreateInstance();
}

Napi::Object GPU::NewInstance(Napi::Env env) {
  Napi::EscapableHandleScope scope(env);
  Napi::Object obj = env.GetInstanceData<Napi::FunctionReference>()->New({});
  return scope.Escape(napi_value(obj)).ToObject();
}

Napi::Value GPU::RequestAdapter(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  Napi::Promise::Deferred deferred = Napi::Promise::Deferred::New(env);

  this->instance.RequestAdapter(
      nullptr, wgpu::CallbackMode::AllowSpontaneous,
      [=](wgpu::RequestAdapterStatus status, wgpu::Adapter adapter,
          const char *message) {
        if (status == wgpu::RequestAdapterStatus::Success) {
          deferred.Resolve(Napi::Object::New(env));
        } else {
          deferred.Reject(Napi::String::New(env, message));
        }
      });

  return deferred.Promise();
}