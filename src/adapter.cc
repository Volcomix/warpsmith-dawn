#include "adapter.h"

Napi::FunctionReference GPUAdapter::constructor;

void GPUAdapter::Init(Napi::Env env) {
  Napi::Function func = DefineClass(env, "GPUAdapter", {});
  constructor = Napi::Persistent(func);
}

GPUAdapter::GPUAdapter(const Napi::CallbackInfo &info)
    : Napi::ObjectWrap<GPUAdapter>(info) {}

Napi::Object GPUAdapter::NewInstance(Napi::Env env) {
  return constructor.New({});
}