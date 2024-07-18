const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: {
        popup: "./scripts/popup.ts",
        background: "./scripts/lals-service-worker.ts",
        content_script: "./scripts/fb-content.ts",
    },
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "../dist"),
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    from: "{styles,templates,images}/*",
                    to: "../dist/[name][ext]",
                },
                { from: "manifest.json", to: "../dist" },
            ], // Copy everything from the styles, templates, and images directories to the dist directory
            options: {},
        }),
    ],
};
