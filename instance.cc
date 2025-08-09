#include "instance.h"

void Instance::Init(Napi::Env env) {
  Napi::Function func = DefineClass(env, "Instance", {});

  Napi::FunctionReference *constructor = new Napi::FunctionReference();
  *constructor = Napi::Persistent(func);
  env.SetInstanceData(constructor);
}

Instance::Instance(const Napi::CallbackInfo &info)
    : Napi::ObjectWrap<Instance>(info) {
  this->instance = wgpu::CreateInstance();
}

Napi::Object Instance::NewInstance(Napi::Env env) {
  Napi::EscapableHandleScope scope(env);
  Napi::Object obj = env.GetInstanceData<Napi::FunctionReference>()->New({});
  return scope.Escape(napi_value(obj)).ToObject();
}