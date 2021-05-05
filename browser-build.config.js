const TerserPlugin = require('terser-webpack-plugin');
require("@babel/polyfill");

module.exports = {
  entry: ["@babel/polyfill", "./src/MapfileStyleParser.ts"],
  mode: 'production',
  output: {
    filename: "mapfileStyleParser.js",
    path: __dirname + "/browser",
    library: "GeoStylerMapfileStyleParser"
  },
  resolve: {
    fallback: {
      fs: false,
      path: false
    },
    // Add '.ts' as resolvable extensions.
    extensions: [".ts", ".js", ".json"]
  },
  optimization: {
    minimizer: [
      new TerserPlugin()
    ]
  },
  module: {
    rules: [
      // All files with a '.ts'
      {
        test: /\.ts$/,
        include: __dirname + '/src',
        use: [
          {
            loader: require.resolve('ts-loader'),
          },
        ],
      }
    ]
  }
};
