#ifndef GPU_H
#define GPU_H

#include "adapter.h"
#include <napi.h>
#include <webgpu/webgpu_cpp.h>

class GPU : public Napi::ObjectWrap<GPU> {
public:
  static void Init(Napi::Env env);
  static Napi::Object NewInstance(Napi::Env env);
  GPU(const Napi::CallbackInfo &info);

private:
  static Napi::FunctionReference constructor;
  Napi::Value RequestAdapter(const Napi::CallbackInfo &info);
  wgpu::Instance instance;
};

#endif // GPU_H