import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';


import * as ION from '../../../src/ion-3d-engine';
// import * as ION from 'ion-3d-engine';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();


ION.showLoadingScreen();


window.addEventListener('load', () => {


  // const engine = new ION.Engine({
  //   canvas: canvas,
  //   fullScreen: true,
  //   control: ION.SpaceControl, 
  //   vrEnabled: true,
  //   stats: true,
  // });

  
  // /* Renderer: */
  // const renderer = new THREE.WebGLRenderer({canvas});
  // renderer.setSize( window.innerWidth, window.innerHeight );

  // /* Scene: */
  // const scene = new THREE.Scene();
  // scene.background = new THREE.Color( 0xffffff );
 
  // /* Camera: */
  // const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 5);
  
  // /* Engine: */
  // const canvas = document.querySelector('#viewport');
  // const engine = new ION.Engine({
  //   canvas,
  //   scene,
  //   camera,
  //   control: ION.SpaceControl, 
  //   vrEnabled: true,
  // });

  // engine.start();


  /* Render: */
  // function render(time) {
  //   renderer.render(scene, camera);
  //   requestAnimationFrame(render);
  // }
  // requestAnimationFrame(render);


  // engine.setRuntimeCallback(() => {
  //   console.log('Running at each frame...');
  // });










  
  // // /* Engine */
  // const canvas = document.getElementById('viewport');


  // // let guiScene = ION.getTemplateScene({
  // //   type: 'ground_0',
  // //   gridHelper: false,
  // //   lights: true,
  // // });


  // const engine = new ION.Engine({
  //   canvas: canvas,
  //   // scene: guiScene,
  //   fullScreen: true,
  //   control: ION.SpaceControl,
  //   // control: ION.FirstPersonControl,
  //   // control: ION.ArcBallControl,
  //   // control: ION.FlyControl,
    
  //   stats: true,
  //   statsOptions: {
  //     stats3D: true,
  //   },

  //   controlOptions: {
  //     vrTeleportEnabled: true, 
  //     vrTeleportList: [], 
  //     framebufferScaleFactor: 2.0, // lower this for for higher performance
  //   },
  //   vrEnabled: true,

  //   graphicsOptions: {
  //     shadowMapEnabled: false,  // was true // this lowers the vr fps from 90~ to 45~
  //     shadowMapType: null,
  //     outputEncoding: null, 
  //     toneMapping: null, // was null
  //     physicallyCorrectLights: false, // was true
  //   },
  // });


  // const floorMesh = engine.scene.getObjectByName('ground_0');
  // // floorMesh.position.y =- 2;
  // engine.setVRTeleportList([floorMesh]);

  // const statsComponent = engine.engineStats.statsEntity.getComponent(ION.GUI_COMPONENT_TYPE);
  
  // engine.setRuntimeCallback(() => {
  //   ION.positionInFront(engine.camera, statsComponent, -2.5, 2.5, -6);
  // });


















  const scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xa0a0a0 );
  scene.fog = new THREE.Fog( 0xa0a0a0, 10, 200 );

  const ground = new THREE.Mesh( new THREE.PlaneGeometry( 400, 400 ), new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } ) );
  ground.rotation.x = - Math.PI / 2;
  ground.position.y = 0;
  ground.receiveShadow = true;
  scene.add( ground );



  const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
  hemiLight.position.set( 0, 10, 0 );
  scene.add( hemiLight );


  const dirLight = new THREE.DirectionalLight( 0xffffff, 0.48 );
  dirLight.target.position.set(0, 0, 0);
  dirLight.position.set( 15, 26, 10 );
  dirLight.castShadow = true;

  // const dirLight = new THREE.DirectionalLight( 0xffffff, 0.48 );
  // dirLight.target.position.set(0, 0, 0);
  // dirLight.position.set( 15, 26, 15 );
  // dirLight.castShadow = true;


  // dirLight.shadow.camera.top = 50;
  // dirLight.shadow.camera.bottom = - 25;
  // dirLight.shadow.camera.left = - 25;
  // dirLight.shadow.camera.right = 25;
  // dirLight.shadow.camera.near = 0.1;
  // dirLight.shadow.camera.far = 200;

  dirLight.shadow.camera.top = 10;
  dirLight.shadow.camera.bottom = - 10;
  dirLight.shadow.camera.left = - 6;
  dirLight.shadow.camera.right = 6;
  
  dirLight.shadow.mapSize.set( 4096, 4096 );
  dirLight.shadow.bias = -0.00001;

  scene.add( dirLight );





  
  const light = new THREE.PointLight( 0xffffff, 2, 100 );
  light.position.set( 10, 16, 8 );
  light.castShadow = true;
  // scene.add( light );



  /* Adding other objects: */
  const geometry = new THREE.BoxGeometry( 2, 2, 2 );
  const material = new THREE.MeshStandardMaterial({ color: new THREE.Color('#e3f0fb') });
  const cube = new THREE.Mesh( geometry, material );
  cube.position.set(-3, 1, -6);
  cube.castShadow = true;
  scene.add( cube );

  const radius = 1;
  const coneHeight = 2;
  const coneRadialSegments = 22;
  const coneGeometry = new THREE.ConeGeometry( radius, coneHeight, coneRadialSegments );
  const coneMaterial = new THREE.MeshStandardMaterial({ color: new THREE.Color('#e3bcc9') });
  const cone = new THREE.Mesh( coneGeometry, coneMaterial );
  cone.castShadow = true;
  cone.position.set(2, 1, -5);
  scene.add( cone );

  const radiusTop = 1;
  const radiusBottom = 1;
  const cylinderHeight = 3;
  const cylinderRadialSegments = 28;
  const cylinderGeometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, cylinderHeight, cylinderRadialSegments );
  const cylinderMaterial = new THREE.MeshStandardMaterial({ color: new THREE.Color('#e8fbd4') });
  const cylinder = new THREE.Mesh( cylinderGeometry, cylinderMaterial );
  cylinder.castShadow = true;
  cylinder.position.set(-8, 1.5, -3);
  scene.add( cylinder );


  const octaRadius = 1;
  const octaGeometry = new THREE.OctahedronGeometry( octaRadius );
  const octaMaterial = new THREE.MeshStandardMaterial({ color: new THREE.Color('#7d9a9e') });
  const octahedron = new THREE.Mesh( octaGeometry, octaMaterial );
  octahedron.castShadow = true;
  octahedron.position.set(-5, 0.57, 3);
  octahedron.rotation.set(Math.PI/3.2, Math.PI/4, 0);
  scene.add( octahedron );


  const torusRadius = 1.4; 
  const tubeRadius = 0.6;
  const radialSegments = 8;
  const tubularSegments = 24;
  const torusGeometry = new THREE.TorusGeometry( torusRadius, tubeRadius, radialSegments, tubularSegments );
  const torusMaterial = new THREE.MeshStandardMaterial({ color: new THREE.Color('#b1b092') });
  const torus = new THREE.Mesh( torusGeometry, torusMaterial );
  torus.castShadow = true;
  torus.position.set(+4, 0.3, 5);
  torus.rotateX(Math.PI/2);
  scene.add( torus );


  
  /* Engine: */
  const canvas = document.getElementById('viewport');
  const engine = new ION.Engine({
      canvas: canvas,
      fullScreen: true,
      scene,
      control: ION.SpaceControl,

      controlOptions: {
        vrTeleportEnabled: true,
        vrTeleportList: [],
        framebufferScaleFactor: 2,
        controlInstructions: true,
    },
      
      stats: true,
      statsOptions: {
        stats3D: true,
      },

      vrEnabled: true,
      graphicsOptions: {
          shadowMapEnabled: true,
          shadowMapType: THREE.PCFShadowMap,
      },

  });


  const statsComponent = engine.engineStats.statsEntity.getComponent(ION.GUI_COMPONENT_TYPE);

  engine.setRuntimeCallback(() => {
    ION.positionInFront(engine.camera, statsComponent, -2.2, 2.2, -6);
  });

  engine.camera.position.set(0, 5, 5);


  // /* Laptop Component */
  // const rootElement = document.getElementsByClassName('main')[0];
  // const guiComponent = new ION.GUIComponent({
  //     rootElement: rootElement,
  //     pixelRatio: 150,
  // });
  // guiComponent.position.set(0, 3.872, -0.847);
  // guiComponent.rotateX(-0.2);
  // guiComponent.scale.set(0.32, 0.32, 0.32);


  // /* Entity */
  // const guiEntity = new ION.Entity();
  // guiEntity.addComponent(guiComponent);
  // engine.addEntity(guiEntity);

  /* System */
  const guiSystem = new ION.GUISystem();
  engine.addSystem(guiSystem);




  // /* Engine: */
  // const canvas = document.getElementById('viewport');
  // const engine = new ION.Engine({
  //     canvas: canvas,
  //     fullScreen: true,
  //     control: ION.SpaceControl,
  //     stats: true,
  //     vrEnabled: true,
  // });


  /* Slider Component */
  const sliderRootElement = document.getElementsByClassName('slider')[0];
  const sliderGuiComponent = new ION.GUIComponent({
      rootElement: sliderRootElement,
      pixelRatio: 150,
  });
  sliderGuiComponent.position.set(0, 3.5, 0);
  sliderGuiComponent.rotateX(-0.1);


  /* Entity */
  const guiEntity = new ION.Entity();
  guiEntity.addComponent(sliderGuiComponent);
  engine.addEntity(guiEntity);


  /* Changing the Camera default position: */
  engine.camera.position.z = 4.5;
  engine.camera.position.y = 3.5;

  /* Engine Start */
  engine.start();




  // /* Sample Component */
  // const rootElement = document.getElementById('sample');
  // const guiComponent = new ION.GUIComponent({
  //     rootElement: rootElement,
  //     pixelRatio: 150,
  // });
  // guiComponent.position.set(0, 3, 0);
  // guiComponent.rotateX(-0.07);

  // /* Entity */
  // const guiEntity = new ION.Entity();
  // guiEntity.addComponent(guiComponent);
  // engine.addEntity(guiEntity);

  // /* System */
  // const guiSystem = new ION.GUISystem();
  // engine.addSystem(guiSystem);

  
  










  /* Engine Start */
  engine.start();



  ION.hideLoadingScreen();

});



