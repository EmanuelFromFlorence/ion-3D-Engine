// import * as mz from '../../build/metazand.js';
// import '../../build/metazand.js';
// import {ttest} from '../../build/metazand.js';

// This works:
import mz from '../../build/metazand.js';
console.log(mz.ttest);
// with webpack config:
// const path = require('path');


// module.exports = {
//   entry: "./src/index.ts",
  
//   output: {
//     path: path.join(__dirname, 'build'),
//     filename: "metazand.js",
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



console.log('In node.js...');

// console.log(mz);
// console.log(ttest);

