const path = require('path');
const HtmlWebPackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

const WEB_EXAMPLE = path.join(__dirname, 'examples', 'web');
const PUBLIC_PATH = path.join(WEB_EXAMPLE, 'public');
// const OUTPUT_PATH = path.join(WEB_EXAMPLE, 'build');
const OUTPUT_PATH = path.join(__dirname, 'build'); // this is the output path for the html file

const htmlPlugin = new HtmlWebPackPlugin({
  template: path.join(PUBLIC_PATH, 'index.html'),
  filename: './index.html' //path.join(OUTPUT_PATH, 'index.html')
});


module.exports = {
  entry: {
    // main: './src/main.ts', // ion-3D-Engine entry
    // web: path.join(WEB_EXAMPLE, 'src', 'index.js'), // also building react web example
    // 'ion-3d-engine': { import: './src/ion-3d-engine.ts', filename: '[name].js'}, // the filename is the relative output path (inside dist in the top level dir)
    // 'main': { import: path.join(WEB_EXAMPLE, 'src', 'index.js'), filename: '[name].js'},
    main: path.join(WEB_EXAMPLE, 'src', 'index.js'),
  },
  
  output: {
    path: OUTPUT_PATH, // PUBLIC_PATH // this is the actual path that it puts everything in (only js files defined in entry)
    // assetModuleFilename: 'assets/[name][ext]',
    // publicPath: PUBLIC_PATH, 
    filename: "[name].js",
  },

  devServer: {
    static: [PUBLIC_PATH],
    // contentBase: 'public',
    // static: [OUTPUT_PATH],
  },

  resolve: {
    extensions: ['*', '.js', '.ts'],
    alias: { // Now, instead of using relative paths when importing ../public...
      // public: PUBLIC_PATH,
      resources: path.resolve(__dirname, 'resources'),
    },
  },

  // Adding source map for better error logs (so not all point to bundler.js)
  devtool: 'inline-source-map', // recommended source-map for prod // https://webpack.js.org/configuration/devtool/ for other options

  plugins: [
    htmlPlugin,
    new CopyPlugin({ // https://github.com/webpack-contrib/copy-webpack-plugin
      patterns: [
        { from: "resources", to: path.join(OUTPUT_PATH, 'resources') },
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
        // include: [
        //   __dirname, // path.resolve(__dirname, 'src'),
        // ],
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




// const path = require('path');


// module.exports = {
//   entry: "./src/index.ts",
  
//   output: {
//     path: path.join(__dirname, 'build'),
//     filename: "ion-3d-engine.js",
//     library: "mz",
//     libraryTarget: "umd",
//     // libraryExport: 'default'
//     globalObject: 'this',
//   },

//   // Adding source map for better error logs (so not all point to bundler.js)
//   devtool: 'inline-source-map',


//   plugins: [],


//   module: {
//     rules: [
//       {
//         test: /\.(js|jsx|ts)$/,
//         exclude: /node_modules/,
//         include: [path.resolve(__dirname, 'src')],
//         use: {
//           loader: "babel-loader"
//         }
//       },
//     ]
//   }
// };
