#include "gpu.h"

Napi::FunctionReference GPU::constructor;

void GPU::Init(Napi::Env env) {
  Napi::Function func =
      DefineClass(env, "GPU",
                  {
                      InstanceMethod("requestAdapter", &GPU::RequestAdapter),
                      InstanceAccessor("wgslLanguageFeatures",
                                       &GPU::GetWGSLLanguageFeatures, nullptr),
                  });

  constructor = Napi::Persistent(func);
  constructor.SuppressDestruct();
}

GPU::GPU(const Napi::CallbackInfo &info) : Napi::ObjectWrap<GPU>(info) {
  this->instance = wgpu::CreateInstance();
}

Napi::Object GPU::NewInstance(Napi::Env env) { return constructor.New({}); }

Napi::Value GPU::RequestAdapter(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  Napi::Promise::Deferred deferred = Napi::Promise::Deferred::New(env);

  this->instance.RequestAdapter(
      nullptr, wgpu::CallbackMode::AllowSpontaneous,
      [=](wgpu::RequestAdapterStatus status, wgpu::Adapter adapter,
          const char *message) {
        if (status == wgpu::RequestAdapterStatus::Success) {
          deferred.Resolve(GPUAdapter::NewInstance(env, &adapter));
        } else {
          deferred.Reject(Napi::String::New(env, message));
        }
      });

  return deferred.Promise();
}

Napi::Value GPU::GetWGSLLanguageFeatures(const Napi::CallbackInfo &info) {
  wgpu::SupportedWGSLLanguageFeatures supportedFeatures;
  this->instance.GetWGSLLanguageFeatures(&supportedFeatures);

  Napi::Env env = info.Env();
  Napi::Object result = env.Global().Get("Set").As<Napi::Function>().New({});
  for (size_t i = 0; i < supportedFeatures.featureCount; i++) {
    wgpu::WGSLLanguageFeatureName feature = supportedFeatures.features[i];
    Napi::String featureName = ConvertWGSLLanguageFeatureName(env, feature);
    if (!featureName.Utf8Value().empty()) {
      result.Get("add").As<Napi::Function>().Call(result, {featureName});
    }
  }

  return result;
}