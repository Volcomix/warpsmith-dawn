{
    "targets": [
        {
            "target_name": "hello",
            "sources": ["hello.cc"],
            "dependencies": [
                "<!(node -p \"require('node-addon-api').targets\"):node_addon_api"
            ],
        }
    ]
}
