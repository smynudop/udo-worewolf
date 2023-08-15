const path = require("path")
const { VueLoaderPlugin } = require('vue-loader');//追加

/**
 * @type {import('webpack').Configuration}
 */
module.exports = {
  mode: "development",
  stats: "minimal",
  entry: "./client/worewolf.ts",
  output: {
    path: path.join(__dirname, "build/public/javascripts"),
    filename: "worewolf.js",
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader",
        exclude: /node_modules/, // <- Don't miss it!
        options: {
          appendTsSuffixTo: [/\.vue$/],
        },
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          // `vue-loader` オプション
          optimizeSSR: false
        }
      },
      {
        test: /\.css$/,
        use: ['vue-style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: [".vue",".ts", ".js"],
  },
  devtool: "source-map",
  plugins: [
    new VueLoaderPlugin()
  ]
}
