{
    "targets": [
        {
            "target_name": "dawn",
            "sources": ["src/dawn.cc", "src/gpu.cc"],
            "includes": ["src/generated/binding.gypi"],
            "dependencies": [
                "<!(node -p \"require('node-addon-api').targets\"):node_addon_api"
            ],
            "include_dirs": ["dawn-binaries/include"],
            "variables": {
                "runtime_dir": "@loader_path",
            },
            "conditions": [
                ["OS=='linux'", {"variables": {"runtime_dir": "'$$ORIGIN'"}}],
            ],
            "link_settings": {
                "libraries": [
                    "-lwebgpu_dawn",
                    "-Wl,-rpath,<(runtime_dir)/../../dawn-binaries/lib",
                ],
                "library_dirs": ["<(module_root_dir)/dawn-binaries/lib"],
            },
        }
    ]
}
