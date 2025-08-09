#ifndef INSTANCE_H
#define INSTANCE_H

#include <napi.h>
#include <webgpu/webgpu_cpp.h>

class Instance : public Napi::ObjectWrap<Instance> {
public:
  static void Init(Napi::Env env);
  static Napi::Object NewInstance(Napi::Env env);
  Instance(const Napi::CallbackInfo &info);

private:
  wgpu::Instance instance;
};

#endif // INSTANCE_H