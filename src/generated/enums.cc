#include "enums.h"

Napi::String ConvertWGSLLanguageFeatureName(Napi::Env env, wgpu::WGSLLanguageFeatureName value) {
  switch (value) {
  case wgpu::WGSLLanguageFeatureName::ReadonlyAndReadwriteStorageTextures:
    return Napi::String::New(env, "readonly_and_readwrite_storage_textures");
  case wgpu::WGSLLanguageFeatureName::Packed4x8IntegerDotProduct:
    return Napi::String::New(env, "packed_4x8_integer_dot_product");
  case wgpu::WGSLLanguageFeatureName::UnrestrictedPointerParameters:
    return Napi::String::New(env, "unrestricted_pointer_parameters");
  case wgpu::WGSLLanguageFeatureName::PointerCompositeAccess:
    return Napi::String::New(env, "pointer_composite_access");
  default:
    return Napi::String::New(env, "");
  }
}