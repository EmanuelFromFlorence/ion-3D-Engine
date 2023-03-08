const path = require('path');

const baseConfig = {
  mode: 'production',

//   entry: './src/ion-3d-engine.ts',
  // Previous config:
//   output: {
//     path: path.resolve(__dirname, 'dist'),
//     filename: 'ion-3d-engine.js',
//    globalObject: 'this',
//    library: {
//      name: 'ion-3d-engine',
//      type: 'umd',
//    },
//   },

//   // https://webpack.js.org/configuration/externals/
//   // This is so it does not bundle dependencies along with the library
  
//   // externalsType: 'module',
//   externals: {
//     three: {
//         commonjs: 'three',
//         commonjs2: 'three',
//         module: 'three',
//         umd: 'three',
//         // root: '_',
//     },
//   },

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



const moduleConfig = {
	target: 'node',

	entry: {
		'../dist/ion-3d-engine.module': './src/ion-3d-engine.ts',
	},

	experiments: {
		outputModule: true,
	},
	output: {
		filename: '[name].js',
		chunkFormat: 'module',
		library: {
			type: 'module',
		},
	},

	// Do not export three.js
	externals: {
		three: 'three',
	},

	...baseConfig
};

const browserConfig = {
	target: 'web',

	entry: {
        '../dist/ion-3d-engine': './src/ion-3d-engine.ts',
	},

	// Do not export three.js
	externals: {
		three: 'THREE',
	},

	...baseConfig
};


module.exports = [ moduleConfig, browserConfig ];
