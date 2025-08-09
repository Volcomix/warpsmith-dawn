#ifndef GPU_H
#define GPU_H

#include <napi.h>
#include <webgpu/webgpu_cpp.h>

class GPU : public Napi::ObjectWrap<GPU> {
public:
  static void Init(Napi::Env env);
  static Napi::Object NewInstance(Napi::Env env);
  GPU(const Napi::CallbackInfo &info);

private:
  void RequestAdapter(const Napi::CallbackInfo &info);
  wgpu::Instance instance;
};

#endif // GPU_H