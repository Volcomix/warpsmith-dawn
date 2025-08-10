#ifndef GPU_H
#define GPU_H

#include "generated/adapter.h"
#include "generated/enums.h"
#include <napi.h>
#include <webgpu/webgpu_cpp.h>

class GPU : public Napi::ObjectWrap<GPU> {
public:
  static void Init(Napi::Env env);
  static Napi::Object NewInstance(Napi::Env env);
  GPU(const Napi::CallbackInfo &info);

private:
  static Napi::FunctionReference constructor;
  wgpu::Instance instance;
  Napi::Value RequestAdapter(const Napi::CallbackInfo &info);
  Napi::Value GetWGSLLanguageFeatures(const Napi::CallbackInfo &info);
};

#endif // GPU_H