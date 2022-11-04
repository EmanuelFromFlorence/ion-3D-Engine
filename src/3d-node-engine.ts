import * as THREE from 'three';
import { SpaceControls } from './control';
// import { loadGLTF } from './io/loader';
import { runEngine } from './nodes/nodes';


let scene;
let camera;
let renderer;
let myControls;
let backgroundTexture;
let htmlPlane;


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


const raycasterOrigin = new THREE.Vector3(0, 0, 0);
const raycasterDirection = new THREE.Vector3(0, - 2, 0);
const near = 0;
const far = 40;
const aimRaycaster = new THREE.Raycaster(raycasterOrigin, raycasterDirection, near, far);

const updateAim = () => {
    let cameraDirection = new THREE.Vector3();
    cameraDirection = camera.getWorldDirection(cameraDirection);
    cameraDirection.normalize();
    aimRaycaster.ray.origin.copy( camera.position );
    aimRaycaster.ray.direction.copy( cameraDirection ); 

    if (!htmlPlane) return; 
    const intersections = aimRaycaster.intersectObjects([htmlPlane], false);
    if (typeof intersections != 'undefined' && intersections.length > 0){
        intersections[0].face
        intersections[0].faceIndex
        intersections[0].object.isMesh
        intersections[0].object.scale
        intersections[0].uv // THREE.Vector2
        // if(typeof intersections[0].object.name != 'undefined'){
        //     // if (intersections[0].object.name.includes('twitter')){}
        // }


        let node = document.getElementsByClassName('App-header')[0];
        let pointerVector2 = intersections[0].uv;
        // console.log(node.scrollWidth * pointerVector2.x, node.scrollHeight * pointerVector2.y);
        
        
        

        // let node = document.getElementsByClassName('App-header')[0];
        // let nodeAPP = document.getElementsByClassName('App')[0];
        // let pointerVector2 = intersections[0].uv;
        // const mouseEvent = new MouseEvent("mouseover", {
        //     view: window,
        //     bubbles: true,
        //     cancelable: true,
        //     offsetX: node.scrollWidth * pointerVector2.x, // node.scrollWidth mnot what we want ultimately because of scrolling and overflow...
        //     offsetY: node.scrollHeight * pointerVector2.y,

        //     clientX: node.scrollWidth * pointerVector2.x, // node.scrollWidth mnot what we want ultimately because of scrolling and overflow...
        //     clientY: node.scrollHeight * pointerVector2.y,

        //     screenX: node.scrollWidth * pointerVector2.x, // node.scrollWidth mnot what we want ultimately because of scrolling and overflow...
        //     screenY: node.scrollHeight * pointerVector2.y,

        //     pageX: node.scrollWidth * pointerVector2.x, // node.scrollWidth mnot what we want ultimately because of scrolling and overflow...
        //     pageY: node.scrollHeight * pointerVector2.y,
        // });
        // console.log(node.scrollWidth * pointerVector2.x);
        
        // nodeAPP.dispatchEvent(mouseEvent);
        // node.dispatchEvent(mouseEvent);
        // window.document.dispatchEvent(mouseEvent);

        // const mouseEvent1 = new MouseEvent("mousemove", {
        //     view: window,
        //     bubbles: true,
        //     cancelable: true,
        //     offsetX: node.scrollWidth * pointerVector2.x, // node.scrollWidth mnot what we want ultimately because of scrolling and overflow...
        //     offsetY: node.scrollHeight * pointerVector2.y,

        //     clientX: node.scrollWidth * pointerVector2.x, // node.scrollWidth mnot what we want ultimately because of scrolling and overflow...
        //     clientY: node.scrollHeight * pointerVector2.y,

        //     screenX: node.scrollWidth * pointerVector2.x, // node.scrollWidth mnot what we want ultimately because of scrolling and overflow...
        //     screenY: node.scrollHeight * pointerVector2.y,

        //     pageX: node.scrollWidth * pointerVector2.x, // node.scrollWidth mnot what we want ultimately because of scrolling and overflow...
        //     pageY: node.scrollHeight * pointerVector2.y,
        // });
        
        // nodeAPP.dispatchEvent(mouseEvent1);
        // node.dispatchEvent(mouseEvent1);
        // window.document.dispatchEvent(mouseEvent1);
        
        

        



        // document.body.addEventListener('click', () => console.log('clicked'))
        //     const evt = new MouseEvent("click", {
        //     view: window,
        //     bubbles: true,
        //     cancelable: true,
        //     clientX: 20,
        // });
        // document.body.dispatchEvent(evt);

    }

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
        updateAim();

        renderHTML();



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


let planeGeometry;


const HTMLPlane = () => {
    planeGeometry = new THREE.PlaneGeometry( 20, 20 );

    let planeMaterial = new THREE.MeshPhongMaterial({color: '#cccccc', side: THREE.DoubleSide});
    planeMaterial.needsUpdate = true;

    htmlPlane = new THREE.Mesh( planeGeometry, planeMaterial );

    scene.add( htmlPlane );
}


const renderHTML = () => {

    const node = document.getElementById('root');
    htmlToImage.toPng(node)
        .then(function (dataUrl) {
            var img = new Image();
            img.src = dataUrl;
            
            let width = node.scrollWidth;
            let height = node.scrollHeight;

            const texture = new THREE.Texture( img );
            texture.needsUpdate = true;
            let planeMaterial = new THREE.MeshPhongMaterial({map: texture, side: THREE.DoubleSide});
            planeMaterial.needsUpdate = true;

            htmlPlane.material = planeMaterial;

        }).catch(function (error) {
            console.error('oops, something went wrong!');
            console.log(error);
            
        });

}





export function run(){
    init();


    
    
    // const node = document.getElementById('root');
    // const containerElm = document.createElement('div');
    


    



    // var node = document.getElementsByClassName('App-header')[0];
    // node.addEventListener('mouseover', async (event) => {
    //     event.target.style.backgroundColor = '#fb61a9';    
    //     console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++++ onmouseover Fired');

    //     // simulateCssEvent('hover');

    //     // let styler = new PseudoStyler();
    //     // await styler.loadDocumentStyles();
    //     // document.getElementById('button').addEventListener('click', () => {
    //     //     const element = document.getElementById('test')
    //     //     styler.toggleStyle(element, ':hover');
    //     // })
    // });


    // // https://stackoverflow.com/questions/902713/how-do-i-programmatically-click-a-link-with-javascript

    // var node = document.getElementsByClassName('App-header')[0];
    // let nodeAPP = document.getElementsByClassName('App')[0];

    // var event = document.createEvent("MouseEvents");
    // event.initMouseEvent("mouseenter", true, true, window,
    //     1, 1, 1, 1, 1,
    //     false, false, false, false,
    //     0, null);
    //     node.dispatchEvent(event);
    //     nodeAPP.dispatchEvent(event);
    //     window.document.dispatchEvent(event);


    
    // var event2 = document.createEvent("MouseEvents");
    // event2.initMouseEvent("mouseover", true, true, window,
    //     1, 1, 1, 1, 1,
    //     false, false, false, false,
    //     0, null);
    //     node.dispatchEvent(event2);
    //     nodeAPP.dispatchEvent(event2);
    //     window.document.dispatchEvent(event2);



    
    // // let node = document.getElementsByClassName('App-header')[0];
    // let nodeAPP = document.getElementsByClassName('App')[0];
    // let pointerVector2 = new THREE.Vector2(0.5, 0.5);
    // const mouseEvent = new MouseEvent("mouseenter", { //mouseover
    //     view: window,
    //     bubbles: true,
    //     cancelable: true,
    //     offsetX: node.scrollWidth * pointerVector2.x, // node.scrollWidth mnot what we want ultimately because of scrolling and overflow...
    //     offsetY: node.scrollHeight * pointerVector2.y,

    //     clientX: node.scrollWidth * pointerVector2.x, // node.scrollWidth mnot what we want ultimately because of scrolling and overflow...
    //     clientY: node.scrollHeight * pointerVector2.y,

    //     screenX: node.scrollWidth * pointerVector2.x, // node.scrollWidth mnot what we want ultimately because of scrolling and overflow...
    //     screenY: node.scrollHeight * pointerVector2.y,

    //     pageX: node.scrollWidth * pointerVector2.x, // node.scrollWidth mnot what we want ultimately because of scrolling and overflow...
    //     pageY: node.scrollHeight * pointerVector2.y,
    // });
    // console.log(node.scrollWidth * pointerVector2.x);
    
    // nodeAPP.dispatchEvent(mouseEvent);
    // node.dispatchEvent(mouseEvent);
    // window.document.dispatchEvent(mouseEvent);

    // const mouseEvent1 = new MouseEvent("mouseover", { //mousemove
    //     view: window,
    //     bubbles: true,
    //     cancelable: true,
    //     offsetX: node.scrollWidth * pointerVector2.x, // node.scrollWidth mnot what we want ultimately because of scrolling and overflow...
    //     offsetY: node.scrollHeight * pointerVector2.y,

    //     clientX: node.scrollWidth * pointerVector2.x, // node.scrollWidth mnot what we want ultimately because of scrolling and overflow...
    //     clientY: node.scrollHeight * pointerVector2.y,

    //     screenX: node.scrollWidth * pointerVector2.x, // node.scrollWidth mnot what we want ultimately because of scrolling and overflow...
    //     screenY: node.scrollHeight * pointerVector2.y,

    //     pageX: node.scrollWidth * pointerVector2.x, // node.scrollWidth mnot what we want ultimately because of scrolling and overflow...
    //     pageY: node.scrollHeight * pointerVector2.y,
    // });
    
    // nodeAPP.dispatchEvent(mouseEvent1);
    // node.dispatchEvent(mouseEvent1);
    // window.document.dispatchEvent(mouseEvent1);
    





 

    



    // runEngine();

    window.onload = () => {
        // renderImage();


        HTMLPlane();
        animating();


        

    };

    
    
}






function simulateCssEvent (type){
    var id = 'simulatedStyle';

    var generateEvent = function(selector){
        var style = "";
        for (var i in document.styleSheets) {
            var rules = document.styleSheets[i].cssRules;
            for (var r in rules) {
                // console.log('Rules::');
                // console.log(rules);
                if(rules[r].cssText && rules[r].selectorText){
                    if(rules[r].selectorText.indexOf(selector) > -1){
                        var regex = new RegExp(selector,"g")
                        var text = rules[r].cssText.replace(regex,"");
                        style += text+"\n";
                    }
                }
            }
        }

        document.head.append("<style id="+id+">"+style+"</style>");
        // $("head").append("<style id="+id+">"+style+"</style>");
    };

    var stopEvent = function(){
        document.getElementById("#"+id).remove();
    };

    switch(type) {
        case "hover":
            return generateEvent(":hover");
        case "stop":
            return stopEvent();
    }
}







// class PseudoStyler {
//     styles: any[];
//     registered: WeakMap<object, any>;
//     uniqueID: number;
//     style: any;
//     constructor() {
//       this.styles = [];
//       this.registered = new WeakMap();
//       this.uniqueID = 0;
//     }
  
//     async loadDocumentStyles() {
//       let count = document.styleSheets.length;
//       for (let i = 0; i < count; i++) {
//         let sheet = document.styleSheets[i];
//         if (sheet.href) {
//           await this.addLink(sheet.href);
//         } else {
//           if (sheet.ownerNode && sheet.ownerNode.nodeName &&
//             sheet.ownerNode.nodeName === "STYLE" && sheet.ownerNode.firstChild) {
//             this.addCSS(sheet.ownerNode.firstChild.textContent);
//           }
//         }
//       }
//     }
  
//     addCSS(text) {
//       let copySheet = document.createElement('style');
//       copySheet.type = 'text/css';
//       copySheet.textContent = text;
//       document.head.appendChild(copySheet);
//       for (let i = 0; i < copySheet.sheet.cssRules.length; i++) {
//         if (copySheet.sheet.cssRules[i].selectorText && copySheet.sheet.cssRules[i].selectorText.includes(':')) {
//           this.styles.push(copySheet.sheet.cssRules[i]);
//         }
//       }
//       document.head.removeChild(copySheet);
//     }
  
//     async addLink(url) {
//       const self = this;
//       await new Promise((resolve, reject) => {
//         fetch(url)
//           .then(res => res.text())
//           .then(res => {
//             self.addCSS(res);
//             resolve(self.styles);
//           })
//           .catch(err => reject(err));
//       });
//     }
  
//     matches(element, selector, pseudoClass) {
//       selector = selector.replace(new RegExp(pseudoClass, 'g'), '');
//       for (let part of selector.split(/ +/)) {
//         try {
//           if (element.matches(part)) {
//             return true;
//           }
//         } catch (ignored) {
//           // reached a non-selector part such as '>'
//         }
//       }
//       return false;
//     }
  
//     register(element, pseudoclass) {
//       let uuid = this.uniqueID++;
//       let customClasses = {};
//       for (let style of this.styles) {
//         if (style.selectorText.includes(pseudoclass)) {
//           style.selectorText.split(/\s*,\s*/g)
//             .filter(selector => this.matches(element, selector, pseudoclass))
//             .forEach(selector => {
//               let newSelector = this._getCustomSelector(selector, pseudoclass, uuid);
//               customClasses[newSelector] = style.style.cssText.split(/\s*;\s*/).join(';');
//             });
//         }
//       }
  
//       if (!this.style) {
//         this._createStyleElement();
//       }
//       for (let selector in customClasses) {
//         let cssClass = selector + ' { ' + customClasses[selector] + ' }';
//         this.style.sheet.insertRule(cssClass);
//       }
//       this.registered.get(element).set(pseudoclass, uuid);
//     }
  
//     deregister(element, pseudoClass) {
//       if (this.registered.has(element) && this.registered.get(element).has(pseudoClass)) {
//         let uuid = this.registered.get(element).get(pseudoClass);
//         let className = this._getMimicClassName(pseudoClass, uuid);
//         let regex = new RegExp(className + '($|\\W)');
//         for (let i = 0; i < this.style.sheet.cssRules.length; i++) {
//           if (regex.test(this.style.sheet.cssRules[i].selectorText)) {
//             this.style.sheet.deleteRule(i);
//           }
//         }
//         this.registered.get(element).delete(pseudoClass);
//         element.classList.remove(className.substr(1));
//       }
//     }
  
//     toggleStyle(element, pseudoclass, force) {
//       if (!this.registered.has(element)) {
//         this.registered.set(element, new Map());
//       }
//       if (!this.registered.get(element).has(pseudoclass)) {
//         this.register(element, pseudoclass);
//       }
//       let uuid = this.registered.get(element).get(pseudoclass);
//       element.classList.toggle(this._getMimicClassName(pseudoclass, uuid).substr(1), force);
//     }
  
//     _getMimicClassName(pseudoClass, uuid) {
//       return pseudoClass.replace(':', '.') + '-pseudostyler-' + uuid;
//     }
  
//     _getCustomSelector(selectorText, pseudoClass, uuid) {
//       return selectorText.replace(new RegExp(pseudoClass, 'g'), this._getMimicClassName(pseudoClass, uuid));
//     }
  
//     _createStyleElement() {
//       let style = document.createElement('style');
//       style.type = 'text/css';
//       document.head.appendChild(style);
//       this.style = style;
//     }
//   }


const renderImage = () => {

    // this was giving error because the element was an empty div::::::: should handle...
    // htmlToImage.toPixelData(node)




    /* ------- toPixelData solution ------- */

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


            htmlPlane = new THREE.Mesh( planeGeometry, planeMaterial );
            // plane.position.y = + 10;
            // plane.receiveShadow = true;
            scene.add( htmlPlane );



            

            /* ------- Below works using our own canvas ------- */

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









