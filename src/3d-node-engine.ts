import * as THREE from 'three';
import { SpaceControls } from './control';
// import { loadGLTF } from './io/loader';
import { runEngine } from './nodes/nodes';


let scene;
let camera;
let renderer;
let myControls;
let backgroundTexture;


const initCamera = () => {
    const fov = 60;
    const aspect = window.innerWidth / window.innerHeight; // 1920 / 1080;
    const near = 0.1;
    const far = 10000; // 100000
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(-10,10,10);
    camera.lookAt(new THREE.Vector3(1,0,0));
}


const initMainLights = () => {
    let dirLight = new THREE.DirectionalLight(0xfff8e2, 1.5); // 0xFFFFFF
    // let pos = new THREE.Vector3(100, 1000, 100);
    dirLight.position.set(-50, 40, 20);
    dirLight.target.position.set(0, 0, 0);
    dirLight.castShadow = true;
    // dirLight.shadow.autoUpdate = false;
    scene.add(dirLight);

    let ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.4);
    // ambientLight.shadow.autoUpdate = false; // errored
    scene.add(ambientLight);
};

const setSceneBackground = () => {
    scene.background = new THREE.Color( 0xffffff );

    // const loader = new THREE.CubeTextureLoader();
    // if(!backgroundTexture){
    //     backgroundTexture = loader.load([
    //         './resources/background/px.png',
    //         './resources/background/nx.png',
    //         './resources/background/py.png',
    //         './resources/background/ny.png',
    //         './resources/background/pz.png',
    //         './resources/background/nz.png',
    //     ]);
    // }
    // scene.background = backgroundTexture;
}

const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();    
    renderer.setSize( window.innerWidth, window.innerHeight );
}


const initControls = () => {
    myControls = new SpaceControls(camera, renderer);
    myControls.setKeyEvents();
    myControls.setLockEvents();
    scene.add(myControls.controls.getObject());
}

const addFloor = () => {
    // const planeGeometry = new THREE.PlaneGeometry( 100, 100 );
    // planeGeometry.rotateX( - Math.PI / 2 );
    // const planeMaterial = new THREE.ShadowMaterial( { color: 0x000000, opacity: 0.2 } );

    // const plane = new THREE.Mesh( planeGeometry, planeMaterial );
    // plane.position.y = - 200;
    // plane.receiveShadow = true;
    // scene.add( plane );

    const helper = new THREE.GridHelper( 200, 100 );
    helper.position.y = - 10;
    helper.material.opacity = 0.55;
    helper.material.transparent = true;
    scene.add( helper );
}


const initGraphics = () => {
    const canvas = document.querySelector('#viewport');
    renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true, alpha: true});
    // this.renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio( window.devicePixelRatio ); 
    renderer.setSize( window.innerWidth, window.innerHeight );
    // renderer.xr.enabled = true;
    
    // Shadows: https://www.youtube.com/watch?v=AUF15I3sy6s
    // Remember this makes it super slow!!!!!!!!!!!!
    renderer.shadowMap.enabled = true;
    // this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default ((which is faster)) THREE.PCFShadowMap // PCFSoftShadowMap VSMShadowMap
    // This changes the colors dramatically and shadoes are not good too (although maybe needed for some of the post processing)!!!
    
    // Why to do this: https://stackoverflow.com/questions/69962432/when-do-we-need-to-use-renderer-outputencoding-three-srgbencoding
    renderer.outputEncoding = THREE.sRGBEncoding;
    // Why to do this https://www.youtube.com/watch?v=6XvqaokjuYU
    // Docs: https://threejs.org/examples/#webgl_tonemapping
    // this.renderer.toneMapping = THREE.ACESFilmicToneMapping; // not much performance diff...

    renderer.physicallyCorrectLights = true;
    window.addEventListener( 'resize', onWindowResize );
}


const animating = () => {
    let prevTime = performance.now();
    const animate = () => {
        // requestAnimationFrame( animate );
        const time = performance.now();
        const delta = ( time - prevTime ) / 1000;

        scene.updateMatrixWorld();

        /* Rendering */
        renderer.render( scene, camera );

        /* Controls */
        myControls.updateControl(delta);

        /* Updates */
        

        prevTime = time;
    }
    // animate();
    renderer.setAnimationLoop( animate );
}


function init(){
    console.log('In init() main.ts...');
    scene = new THREE.Scene();

    initCamera();
    initMainLights();
    initGraphics();
    initControls();
    setSceneBackground();
    addFloor();
}


// =============================================================================================

import * as htmlToImage from 'html-to-image';
// import { toPng, toJpeg, toBlob, toPixelData, toSvg } from 'html-to-image';


const renderImage = () => {

    // this was giving error because the element was an empty div::::::: should handle...
    // htmlToImage.toPixelData(node)



    // function filter (node) {return (node.tagName !== 'i');}
    // htmlToImage.toSvg(document.getElementById('root'), {  }) // filter: filter
    //     .then(function (dataUrl) {
    //         /* do something */
    //         console.log('dataUrl:');
    //         console.log(dataUrl);
    //         console.log(window.atob(dataUrl));
    //     });

    
    // htmlToImage.toPng(document.getElementById('root'))
    //     .then(function (dataUrl) {
    //         // download(dataUrl, 'my-node.png');

    //     });
    

    

    // // const node = document.getElementById('root');
    // let node = document.getElementsByClassName('App-link')[0];
    // htmlToImage.toPixelData(node).then(function (pixels) {
    //     console.log(pixels);
        
    //     // let pixelAtXY;
    //     // for (var y = 0; y < node.scrollHeight; ++y) {
    //     //     for (var x = 0; x < node.scrollWidth; ++x) {
    //     //         let pixelAtXYOffset = (4 * y * node.scrollHeight) + (4 * x);
    //     //         /* pixelAtXY is a Uint8Array[4] containing RGBA values of the pixel at (x, y) in the range 0..255 */
    //     //         pixelAtXY = pixels.slice(pixelAtXYOffset, pixelAtXYOffset + 4);
    //     //     }
    //     // }



    //     // let width = node.scrollWidth;
    //     // let height = node.scrollHeight;


    //     // const planeGeometry = new THREE.PlaneGeometry( 100, 100 );
    //     // // planeGeometry.rotateX( - Math.PI / 2 );
    //     // // const planeMaterial = new THREE.ShadowMaterial( { color: 0xcccccc, opacity: 0.8 } );

    //     // // https://threejs.org/docs/#api/en/textures/DataTexture
    //     // const planeMaterial = new THREE.DataTexture( pixels, width, height );
    //     // planeMaterial.needsUpdate = true;


    //     // const plane = new THREE.Mesh( planeGeometry, planeMaterial );
    //     // plane.position.y = - 10;
    //     // plane.receiveShadow = true;
    //     // scene.add( plane );

    // });


    // const node = document.getElementById('box-main');
    const node = document.getElementById('root');
    htmlToImage.toPng(node)
        .then(function (dataUrl) {
            // console.log('dataUrl:');
            // console.log(dataUrl);
            
            var img = new Image();
            img.src = dataUrl;
            // document.body.appendChild(img);
            // console.log(img);
            
            
            // to download:
            // var link = document.createElement('a');
            // link.download = 'my-image-name.jpeg';
            // link.href = dataUrl;
            // link.click();


            let width = node.scrollWidth;
            let height = node.scrollHeight;


            const planeGeometry = new THREE.PlaneGeometry( 20, 20 );

            // const texture = new THREE.TextureLoader().load( img );
            const texture = new THREE.Texture( img );
            texture.needsUpdate = true;
            let planeMaterial = new THREE.MeshPhongMaterial({map: texture, side: THREE.DoubleSide});
            planeMaterial.needsUpdate = true;


            const plane = new THREE.Mesh( planeGeometry, planeMaterial );
            // plane.position.y = + 10;
            // plane.receiveShadow = true;
            scene.add( plane );



            

            /* Below works using our own canvas:::: */

            // const planeGeometry = new THREE.PlaneGeometry( 20, 20 );
            // // // planeGeometry.rotateX( - Math.PI / 2 );
            // // // const planeMaterial = new THREE.ShadowMaterial( { color: 0xcccccc, opacity: 0.8 } );

            // // // https://threejs.org/docs/#api/en/textures/DataTexture
            // // const texture = new THREE.DataTexture( pixels, width, height );
            // // texture.needsUpdate = true;

        

            // convertURIToImageData(dataUrl).then(function(imageData: any) {
            //     // Here you can use imageData
            //     console.log(imageData);

            //     const texture = new THREE.DataTexture( imageData.data, imageData.width, imageData.height );
            //     texture.needsUpdate = true;
            //     let planeMaterial = new THREE.MeshPhongMaterial({map: texture, side: THREE.DoubleSide});
            //     planeMaterial.needsUpdate = true;


            //     const plane = new THREE.Mesh( planeGeometry, planeMaterial );
            //     // plane.position.y = + 10;
            //     // plane.receiveShadow = true;
            //     scene.add( plane );


            //     // let texture = THREE.loadTexture( dataUrl );
            //     // let texture = new THREE.TextureLoader().load( imageData );
            //     // texture.needsUpdate = true;
            //     // let planeMaterial = new THREE.MeshPhongMaterial({map: texture});
            //     // planeMaterial.needsUpdate = true;


            //     // const plane = new THREE.Mesh( planeGeometry, planeMaterial );
            //     // // plane.position.y = + 10;
            //     // plane.receiveShadow = true;
            //     // scene.add( plane );
            // });


            



            
        }).catch(function (error) {
            console.error('oops, something went wrong!');
            console.log(error);
            
          });;

}


// https://stackoverflow.com/questions/17591148/converting-data-uri-to-image-data
function convertURIToImageData(URI) {
    return new Promise(function(resolve, reject) {
      if (URI == null) return reject();

      var canvas = document.createElement('canvas'),
          context = canvas.getContext('2d'),
          image = new Image(); 
          
      image.addEventListener('load', function() {
        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(context.getImageData(0, 0, canvas.width, canvas.height));
      }, false);
      image.src = URI;
    });
  }






export function run(){
    init();
    animating();

    // runEngine();

    window.onload = () => {
        renderImage();
        // Promise.resolve(setTimeout(() => {        
        //     renderImage();
        // }, 1000));
    };

    
    
}



// window.onload = async () => {
//     init();
//     animating();

//     // loadGLTF('Box.glft', scene);
//     // loadGLTF('../public/Box.glft', scene);
//     // loadGLTF('../resources/Box.glft', scene);


//     // loadGLTF('resources/Box.gltf', scene);
    
    
//     run();



//     // await Promise.resolve(setTimeout(() => {        
        
//     //     console.log(scene.getObjectByName( "Mesh" ));
        



//     //     // scene.traverse((child) => {
//     //     //     let meshName = child.userData.name;
//     //     //     console.log(`child:`);
//     //     //     console.log(child);
//     //     // });

//     // }, 1000));

    
// }
