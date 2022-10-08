const path = require('path');
const HtmlWebPackPlugin = require("html-webpack-plugin");


const htmlPlugin = new HtmlWebPackPlugin({
  template: "./index.html",
  filename: "./index.html"
});


module.exports = {
  entry: "./src/main.ts",
  
  output: {
    path: path.join(__dirname, 'public'),
    filename: "[name].js"
  },

  devServer: {
    static: [path.join(__dirname, 'public')],
  },

  // Adding source map for better error logs (so not all point to bundler.js)
  devtool: 'inline-source-map',

  plugins: [
    htmlPlugin
  ],

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
      {
        test: /\.s?css$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        loader: "file-loader",
        options: { name: 'static/[hash].[ext]' }
      },
    ]
  }
};
