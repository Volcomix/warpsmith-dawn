#ifndef ENUMS_H
#define ENUMS_H

#include <napi.h>
#include <webgpu/webgpu_cpp.h>

Napi::String ConvertWGSLLanguageFeatureName(Napi::Env env, wgpu::WGSLLanguageFeatureName value);

#endif // ENUMS_H