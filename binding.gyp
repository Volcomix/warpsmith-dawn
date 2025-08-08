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
                "libraries": ["-lwebgpu_dawn", "-Wl,-rpath,dawn-binaries/lib"],
                "library_dirs": ["../dawn-binaries/lib"],
            },
        }
    ]
}
