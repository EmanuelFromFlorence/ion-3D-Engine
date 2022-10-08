// These two below have to be commented and not working becasue how webpack is setup.
// Err: Uncaught TypeError: Cannot set properties of undefined at webpackUniversalModuleDefinition
// import * as mz from '/metazand.js';
// import mz from '/metazand.js';

console.log('In main.js...');

window.onload = () => {
    console.log('In onload...');

    console.log(mz);
    console.log(mz.ttest);
}


// console.log(test);

