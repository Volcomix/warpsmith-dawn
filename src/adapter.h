#ifndef ADAPTER_H
#define ADAPTER_H

#include <napi.h>
#include <webgpu/webgpu_cpp.h>

class GPUAdapter : public Napi::ObjectWrap<GPUAdapter> {
public:
  static void Init(Napi::Env env);
  static Napi::Object NewInstance(Napi::Env env);
  GPUAdapter(const Napi::CallbackInfo &info);

private:
  static Napi::FunctionReference constructor;
  wgpu::Adapter adapter;
};

#endif // ADAPTER_H