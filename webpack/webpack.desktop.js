const common = require("./webpack.common.js");
const CopyPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");

module.exports = {
    ...common,
    entry: {
        popup: "./scripts/popup.ts",
    },
    mode: "production",
    optimization: {
        minimize: true, // Enable minification
        minimizer: [new TerserPlugin()], // Use TerserPlugin for minification
        usedExports: true, // Enable tree shaking
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    from: "styles/popup.css",
                    to: "../dist/[name][ext]",
                },
                {
                    from: "styles/settings.css",
                    to: "../dist/[name][ext]",
                },
                {
                    from: "{templates,images}/*",
                    to: "../dist/[name][ext]",
                },
            ], // Copy everything from the styles, templates, and images directories to the dist directory
            options: {},
        }),
        new CompressionPlugin({
            filename: "[path][base].br",
            algorithm: "brotliCompress",
            test: /\.(js|css|html|svg)$/,
            compressionOptions: {
                level: 11,
            },
            // threshold: 10240,
            // minRatio: 0.8,
            deleteOriginalAssets: false,
        }),
    ],
};
