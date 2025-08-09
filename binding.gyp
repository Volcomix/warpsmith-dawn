{
    "targets": [
        {
            "target_name": "hello",
            "sources": ["hello.cc"],
            "dependencies": [
                "<!(node -p \"require('node-addon-api').targets\"):node_addon_api"
            ],
            "include_dirs": ["dawn-binaries/include"],
            "link_settings": {
                "variables": {
                    "lib_dir": "lib",
                    "conditions": [
                        ["target_arch=='x64'", {"lib_dir": "lib64"}],
                        ["OS=='linux'", {"runtime_dir": "'$$ORIGIN'"}],
                        ["OS=='mac'", {"runtime_dir": "@loader_path"}],
                    ],
                },
                "libraries": [
                    "-lwebgpu_dawn",
                    "-Wl,-rpath,<(runtime_dir)/../../dawn-binaries/<(lib_dir)",
                ],
                "library_dirs": ["<(module_root_dir)/dawn-binaries/<(lib_dir)"],
            },
        }
    ]
}
