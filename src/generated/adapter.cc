#include "adapter.h"

Napi::FunctionReference GPUAdapter::constructor;

void GPUAdapter::Init(Napi::Env env) {
  Napi::Function func = DefineClass(env, "GPUAdapter", {});

  constructor = Napi::Persistent(func);
  constructor.SuppressDestruct();
}

GPUAdapter::GPUAdapter(const Napi::CallbackInfo &info)
    : Napi::ObjectWrap<GPUAdapter>(info) {
  this->adapter = info[0].As<Napi::External<wgpu::Adapter>>().Data();
}

Napi::Object GPUAdapter::NewInstance(Napi::Env env, wgpu::Adapter *adapter) {
  return constructor.New({Napi::External<wgpu::Adapter>::New(env, adapter)});
}