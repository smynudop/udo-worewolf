const path = require("path")

module.exports = {
    mode: "development",
    entry: "./client/worewolf.ts",
    target: "node",
    output: {
        path: path.join(__dirname, "build/public/javascripts"),
        filename: "worewolf.js",
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: "ts-loader",
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    devtool: "source-map",
}
