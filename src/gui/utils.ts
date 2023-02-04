import * as THREE from 'three';
import { CompleteStyleList, ExcluderKey, ionicTileImageURI } from '../core/constants';
import { createCirclePoints, createCubicPoints, createGlowMaterial } from '../nodes/utils';


export const GUI_COMPONENT_TYPE  = 'gui_1000'


const setDefault = (x: any): boolean => x !== false && ( x === undefined || x === null || x === true );


export function getRepeatingTexture(imgDataURI, surfWidth, surfHeight) {
  const texture = new THREE.TextureLoader().load(imgDataURI);
  texture.repeat.set(surfWidth, surfHeight); // (timesToRepeatHorizontally, timesToRepeatVertically)
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}


export function getGround0(width, height) {
  const texture = getRepeatingTexture(ionicTileImageURI, width, height);
  const floorMaterial = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
  });
  // floorMaterial.needsUpdate = true;

  const floorGeometry = new THREE.PlaneGeometry( width, height );
  floorGeometry.rotateX( - Math.PI / 2 );

  const floorMesh = new THREE.Mesh( floorGeometry, floorMaterial );
  floorMesh.position.y = 0;

  return floorMesh;
}


export function addDefaultSurfaces(surfaces, type, size = 30){
  surfaces = surfaces || new THREE.Object3D();
  
  if (type === 'ground_0') {
    let floorMesh = getGround0(size, size);
    surfaces.add(floorMesh);
  }


  if (type === 'room_0') {
    // Floor:
    const floorMesh = getGround0(size, size);
    surfaces.add(floorMesh);

    // Wall Material:   
    let width = size;
    let height = size/2;
    let texture = getRepeatingTexture(ionicTileImageURI, width, height);
    const wallMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#ffffff'), // you can make it darker for darker tiles...
      map: texture,
      side: THREE.DoubleSide,
      // combine: THREE.AddOperation,
    });

    // Back Wall:
    const backWallGeometry = new THREE.PlaneGeometry( width, height );
    const backWallMesh = new THREE.Mesh( backWallGeometry, wallMaterial );
    backWallMesh.position.set(0, height/2, size/2);
    backWallMesh.rotation.x = Math.PI
    surfaces.add(backWallMesh);

    
    const frontWallMesh = backWallMesh.clone();
    frontWallMesh.position.set(0, height/2, -size/2);
    surfaces.add(frontWallMesh);


    const rightWallMesh = backWallMesh.clone();
    rightWallMesh.position.set(size/2, height/2, 0);
    rightWallMesh.rotation.y = Math.PI/2;
    surfaces.add(rightWallMesh);


    const leftWallMesh = backWallMesh.clone();
    leftWallMesh.position.set(-size/2, height/2, 0);
    leftWallMesh.rotation.y = Math.PI/2;
    surfaces.add(leftWallMesh);

    const ceilingMesh = floorMesh.clone();
    ceilingMesh.position.set(0, height, 0);
    surfaces.add(ceilingMesh);
    
  }

  return surfaces;
}


// A default scene creator
export function createGUITemplateScene({
    background = null,
    surfaces = null,
    lights = null,
    horizonGlow = null,
    points = null,
    size = 200,
    fog = null,
  } = {}): THREE.Scene{
    let scene = new THREE.Scene();
    const backgroundColor = '#1a1a1a'; // '#b6d9ed' #7f94a7 #eef7ff

    if (setDefault(background)) {
      const loader = new THREE.CubeTextureLoader();
      background = loader.load([
        '../../resources/background/px.png',
        '../../resources/background/nx.png',
        '../../resources/background/py.png',
        '../../resources/background/ny.png',
        '../../resources/background/pz.png',
        '../../resources/background/nz.png',
      ]);

    }
    scene.background = background;

    if (setDefault(surfaces)) {
      surfaces = addDefaultSurfaces(surfaces, 'ground_0', size);
    }
    scene.add(surfaces);

    /* Glow Material */
    // if (setDefault(horizonGlow)) {
    //   const glowMaterial = createGlowMaterial({
    //     glowCoefficient: 0.1,
    //     glowColor: '#d0ffa9',
    //     glowPower: 4,
    //     // materialSide: THREE.BackSide,
    //     blending: THREE.AdditiveBlending,
    //   });
    //   // const edgeGeometry = new THREE.CylinderGeometry( size/8, size/8, size + size/10, 12 );
    //   // const edgeGeometry = new THREE.CapsuleGeometry( size/8, size + size/10, 12, 12 );
    //   const edgeGeometry = new THREE.TorusGeometry( size/2 + size/8, size/8, 6, 40 );
      
    //   horizonGlow = new THREE.Mesh( edgeGeometry, glowMaterial );
    //   horizonGlow.position.y = 0;
    //   // edgeMesh0.position.z = - size / 2;
    //   horizonGlow.rotateX( - Math.PI / 2 ); //  + Math.PI / 8
    //   horizonGlow.rotateZ( Math.PI / 2 );
    // }
    // scene.add(horizonGlow);

    
    if (setDefault(points)) {
      let circleRadius = size/2;
      let offset = size/6;

      const circlePointsMesh1 = createCirclePoints({
        pointCircleRadius: circleRadius,
        pointCount: 500,
        noiseOffset: offset,
        pointSize: 0.15,
      });
      circlePointsMesh1.rotateX( Math.PI / 2 );
      circlePointsMesh1.position.y = size/3.8;
      scene.add( circlePointsMesh1 );

      const cubicPointsMesh1 = createCubicPoints({
        cubeSize: circleRadius,
        pointCount: 70,
        noiseOffset: offset,
        pointSize: 0.15,
      });
      cubicPointsMesh1.position.set(0, size/4, 0);
      scene.add( cubicPointsMesh1 );
    }else {
      scene.add(points)
    }
    
    if (setDefault(lights)) {
      scene = initDefaultGUILights(scene);
    }

    if (setDefault(fog)) {
      scene.fog = fog; // new THREE.Fog(backgroundColor, size/4, size/2.5);
    }
    
    return scene;
}


export function initDefaultGUILights (scene: THREE.Scene): void {
  let dirLight = new THREE.DirectionalLight(0xfff8e2, 1); // 0xFFFFFF
  // let pos = new THREE.Vector3(100, 1000, 100);
  dirLight.position.set(-50, 40, 20);
  dirLight.target.position.set(0, 0, 0);
  // dirLight.castShadow = true;
  // dirLight.shadow.autoUpdate = false;
  // scene.add(dirLight);
  
  let ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.3);
  // ambientLight.shadow.autoUpdate = false; // errored
  scene.add(ambientLight);
  return scene;


  // const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
  // hemiLight.position.set( 0, 200, 0 );
  // scene.add( hemiLight );

  // const dirLight = new THREE.DirectionalLight( 0xffffff );
  // dirLight.position.set( 0, 200, 100 );
  // dirLight.castShadow = true;
  // dirLight.shadow.camera.top = 180;
  // dirLight.shadow.camera.bottom = - 100;
  // dirLight.shadow.camera.left = - 120;
  // dirLight.shadow.camera.right = 120;
  // scene.add( dirLight );

}


export function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.crossOrigin = 'anonymous';
    img.decoding = 'sync';
    img.src = url;
  })
}


export function isTextBox(element) {
  let tagName = element.tagName || '';
  tagName = tagName.toLowerCase();
  if (tagName === 'textarea') return true;
  if (tagName !== 'input') return false;
  let type = element.getAttribute('type') || '';
  type = type.toLowerCase();
  // if any of these input types is not supported by a browser, it will behave as input type text.
  let inputTypes = ['text', 'password', 'number', 'email', 'tel', 'url', 'search', 'date', 'datetime', 'datetime-local', 'time', 'month', 'week'];
  return inputTypes.indexOf(type) >= 0;
}


export function isRadioCheckBox(element) {
  let tagName = element.tagName.toLowerCase();
  if (tagName !== 'input') return false;
  let type = element.getAttribute('type').toLowerCase();
  let inputTypes = ['checkbox', 'radio'];
  return inputTypes.indexOf(type) >= 0;
}


export function buildPageStyleString() {
  let pageStyle = '';
  for (let stylesheet of document.styleSheets) {
      // console.log(stylesheet);
      for (let cssRule of stylesheet.cssRules){
          pageStyle = `${pageStyle} \n ${cssRule.cssText}`;
      }
  }
  return pageStyle;
}


export function buildPageStyleList(setPageStyleMap) {

  for (let script of document.scripts) {

    if (script.hasAttribute('src')) {
      let url = '';
      if (script.src.includes('http')) {
        url = script.src;
      } else {
        url = `${window.location.origin}/${script.src}`;
      }

      fetch(url).then((response) => response.body)
      .then((readableStream) => {

        const reader = readableStream.getReader();
        return new ReadableStream({
          start(controller) {
            // The following function handles each data chunk
            function push() {
              // "done" is a Boolean and value a "Uint8Array"
              reader.read().then(({ done, value }) => {
                // If there is no more data to read
                if (done) {
                  // console.log('done', done);
                  controller.close();
                  return;
                }
                // Get the data and send it to the browser via the controller
                controller.enqueue(value);
                // Check chunks by logging to the console
                // console.log(done, value);
                push();
              });
            }
    
            push();
          },
        });
      })
      .then((stream) => {
        // Respond with our stream
        return new Response(stream, { headers: { 'Content-Type': 'text/html' } }).text();
      }).then((textContent) => {
        if (textContent.includes(ExcluderKey)) return;

        /* BUILDING THE STYLE LIST */
        for (let styleName of CompleteStyleList) {
          
          if (textContent.includes(styleName)) {
            
            setPageStyleMap(styleName, true);
            
          }
        }
        
      })
      .catch((err) => {
        console.error(err);
      });

    } else { // if inline script

      for (let styleName of CompleteStyleList) {
        if (script.textContent.includes(styleName)) {

          setPageStyleMap(styleName, true);

        }
      }
      

    }
  }  
}


export function callbackOnNodesRecursive<T extends HTMLElement>(
  node: T,
  callback: Function,
): void {

  for (const child of node.children) {
    callback(child);
    callbackOnNodesRecursive(child, callback);
  }

}

