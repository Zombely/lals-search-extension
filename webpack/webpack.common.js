const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: {
        popup: "./scripts/popup.ts", // Entry file for the popup
        background: "./scripts/lals-service-worker.ts", // Entry file for the background
        content_script: "./scripts/fb-content.ts", // Entry file for the content script
    },
    module: {
        rules: [
            {
                test: /\.ts?$/, // Match both .ts and .tsx files
                use: "ts-loader", // Use ts-loader to transpile TypeScript to JavaScript
                exclude: /node_modules/, // Exclude the node_modules directory
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".js"], // Resolve these extensions
    },
    output: {
        filename: "[name].js", // Output bundle file name
        path: path.resolve(__dirname, "../dist"), // Output directory
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: ".", to: "../dist", context: "styles" },
                { from: ".", to: "../dist", context: "templates" },
                { from: ".", to: "../dist", context: "images" },
                { from: "manifest.json", to: "../dist" },
            ], // Copy everything from the styles, templates, and images directories to the dist directory
            options: {},
        }),
    ],
};
