const path = require("path");
const { VueLoaderPlugin } = require("vue-loader");
const MinifyHtmlWebpackPlugin = require("minify-html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CircularDependencyPlugin = require("circular-dependency-plugin");
const { DefinePlugin } = require("webpack");

module.exports = {
  resolve: {
    alias: {
      vue: "@vue/compat",
    },
  },
  entry: {
    background: "./src/js/controllers/background/backgroundController.js",
    content: "./src/js/controllers/content/contentController.js",
    "content.frameInjector":
      "./src/js/controllers/content.frameInjector/frameInjectorController.js",
    popup: "./src/js/controllers/popupController/popupController.js",
    backendApp: "./src/js/controllers/backendApp/backendApp.js",
    splash: "./src/sass/splash.scss",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist/js"),
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        styles: {
          name: "styles",
          test: /\.css$/,
          chunks: "all",
          enforce: true,
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: "vue-loader",
        options: {
          compilerOptions: {
            compatConfig: {
              MODE: 2,
            },
          },
        },
      },
      {
        test: /\.(css|sass|scss)$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
    ],
  },
  plugins: [
    new DefinePlugin({
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
    }),
    new CircularDependencyPlugin({
      // exclude detection of files based on a RegExp
      exclude: /dist|node_modules/,
      // include specific files based on a RegExp
      include: /src/,
      // add errors to webpack instead of warnings
      failOnError: false,
      // allow import cycles that include an asyncronous import,
      // e.g. via import(/* webpackMode: "weak" */ './file.js')
      allowAsyncCycles: false,
      // set the current working directory for displaying module paths
      cwd: process.cwd(),
    }),
    new VueLoaderPlugin(),
    // new MinifyHtmlWebpackPlugin({
    //     src: './src/html',
    //     dest: './dist/html',
    //     rules: {
    //         collapseBooleanAttributes: true,
    //         collapseWhitespace: true,
    //         removeAttributeQuotes: true,
    //         removeComments: true,
    //         minifyJS: true,
    //     },
    // }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "./src/html"),
          to: path.resolve(__dirname, "./dist/html"),
        },
        {
          from: path.resolve(__dirname, "./src/manifest.json"),
          to: path.resolve(__dirname, "./dist"),
        },
        {
          from: "*",
          to: path.resolve(__dirname, "./dist/img"),
          context: "src/img",
        },
        {
          from: "**/*",
          to: path.resolve(__dirname, "./dist/fonts"),
          context: "src/fonts/",
        },
      ],
    }),
    new MiniCssExtractPlugin({
      filename: "../css/[name].css",
    }),
  ],
};
