const path = require('path');

module.exports = {
  entry: './src/ion-3d-engine.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'ion-3d-engine.js',
   globalObject: 'this',
   library: {
     name: 'ion-3d-engine',
     type: 'umd',
   },
  },

  // https://webpack.js.org/configuration/externals/
  // This is so it does not bundle dependencies along with the library
  
  // externalsType: 'module',
  externals: {
    three: {
    //   commonjs: 'three',
    //   commonjs2: 'three',
      umd: 'three',
      
    //   root: '_',
    },
  },

  resolve: {
    extensions: ['*', '.js', '.ts'],
    alias: {
      resources: path.resolve(__dirname, 'resources'),
    },
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx|ts)$/,
        exclude: /node_modules/,
        // include: [
        //   __dirname, // path.resolve(__dirname, 'src'),
        // ],
        use: {
          loader: "babel-loader"
        },
      },
    ]
  },

};
