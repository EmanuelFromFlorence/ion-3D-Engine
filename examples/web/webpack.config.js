const path = require('path');
const HtmlWebPackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");


const htmlPlugin = new HtmlWebPackPlugin({
  template: "./index.html",
  filename: "./index.html"
});


module.exports = {
  entry: {
    main: './src/main.ts',
  },
  
  output: {
    path: path.join(__dirname, 'public'),
    // assetModuleFilename: 'assets/[name][ext]',
    publicPath: path.join(__dirname, 'public'),
    filename: "[name].js"
  },

  devServer: {
    static: [path.join(__dirname, 'public')],
    // contentBase: 'public',
  },

  resolve: {
    extensions: ['*', '.js', '.ts'],
    alias: { // Now, instead of using relative paths when importing ../public...
      public: path.resolve(__dirname, 'public'),
      resources: path.resolve(__dirname, 'resources'),
    },
  },

  // Adding source map for better error logs (so not all point to bundler.js)
  devtool: 'inline-source-map',

  plugins: [
    htmlPlugin,
    new CopyPlugin({ // https://github.com/webpack-contrib/copy-webpack-plugin
      patterns: [
        { from: "resources", to: "resources" },
      ],
    }),
  ],

  module: {
    rules: [
      // {
      //   test: /\.html$/, 
      //   exclude: /index\.html$/, 
      //   loader: 'html-loader'
      // },
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
        type: 'asset/resource',
        generator: {
          filename: '[name].[ext]?[hash]',
        },
      },
      {
        test: /\.(glb|gltf|bin)$/,
        type: 'asset/resource',
        generator: {
          filename: '[name].[ext]?[hash]',
        },
      },
      // {
      //   test: /\.(glb|gltf|bin)$/,
      //   use:
      //   [
      //       {
      //           loader: 'file-loader',
      //           options:
      //           {
      //               outputPath: 'assets/models/'
      //           }
      //       }
      //   ]
      // },


      // use: [{
      //   loader: 'file-loader',
      //   options: {
      //     name: '[name].[ext]',
      //     outputPath: 'images/'
      //   }
      // }]
    ]
  }
};
