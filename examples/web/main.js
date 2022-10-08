// These two below have to be commented and not working becasue how webpack is setup.
// Err: Uncaught TypeError: Cannot set properties of undefined at webpackUniversalModuleDefinition
// import * as mz from '/gltf-engine.js';
// import mz from '/gltf-engine.js';

console.log('In main.js...');

window.onload = () => {
    console.log('In onload...');

    console.log(mz);
    console.log(mz.ttest);
}


// console.log(test);

