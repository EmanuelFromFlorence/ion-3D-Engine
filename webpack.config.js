const path = require('path');


module.exports = {
  entry: "./src/index.ts",
  
  output: {
    path: path.join(__dirname, 'build'),
    filename: "metazand.js",
    library: "mz",
    libraryTarget: "umd",
    // libraryExport: 'default'
    globalObject: 'this',
  },

  // Adding source map for better error logs (so not all point to bundler.js)
  devtool: 'inline-source-map',


  plugins: [],


  module: {
    rules: [
      {
        test: /\.(js|jsx|ts)$/,
        exclude: /node_modules/,
        include: [path.resolve(__dirname, 'src')],
        use: {
          loader: "babel-loader"
        }
      },
    ]
  }
};
