{
    "targets": [
        {
            "target_name": "dawn",
            "sources": ["dawn.cc", "gpu.cc"],
            "dependencies": [
                "<!(node -p \"require('node-addon-api').targets\"):node_addon_api"
            ],
            "include_dirs": ["dawn-binaries/include"],
            "variables": {
                "lib_dir": "lib",
                "runtime_dir": "@loader_path",
            },
            "conditions": [
                ["target_arch=='x64'", {"variables": {"lib_dir": "lib64"}}],
                ["OS=='linux'", {"variables": {"runtime_dir": "'$$ORIGIN'"}}],
            ],
            "link_settings": {
                "libraries": [
                    "-lwebgpu_dawn",
                    "-Wl,-rpath,<(runtime_dir)/../../dawn-binaries/<(lib_dir)",
                ],
                "library_dirs": ["<(module_root_dir)/dawn-binaries/<(lib_dir)"],
            },
        }
    ]
}
