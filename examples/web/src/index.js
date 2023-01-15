import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';


import * as ION from '../../../src/ion-3d-engine'


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


window.addEventListener('load', () => {
  
  /* Engine */
  const canvas = document.getElementById('viewport');
  

  let guiScene = ION.createGUITemplateScene({
    lights: true,
    fog: true,
  });

  const engine = new ION.Engine({
    canvas: canvas, 
    scene: guiScene, 
    fullScreen: true,
    control: ION.SpaceControl,
    // control: ION.FirstPersonControl,
    // control: ION.ArcBallControl,
    // control: ION.FlyControl,
    
    controlOptions: {vrTeleportEnabled: false, vrTeleportList: []},
    vrEnabled: true,
  });

  // /* Component */
  // const rootElement = document.getElementById('root');
  // // should do these in GUIComponent init step:
  // rootElement.style.position = 'fixed';
  // rootElement.style.width = `512px`;
  // rootElement.style.height = `512px`;
  // rootElement.style.overflow = 'hidden'; // This will not allow the content to exceed the container
  // // rootElement.style.overflow = 'auto'; // This will automatically add scrollbars to the container when...
  // rootElement.style.margin = '0 auto';

  const rootElement = document.getElementById('container');
  // rootElement.style.background = '#000000';
  const guiComponent = new ION.GUIComponent({
    rootElement: rootElement,
    ratio: 1,
    transparent: false,
  });
  guiComponent.position.y = 5;
  guiComponent.position.z = -2;
  guiComponent.position.x = -4;
  guiComponent.rotateY(0.2);

  /* Entity */
  let guiEntity = new ION.Entity();
  guiEntity.addComponent(guiComponent);
  engine.addEntity(guiEntity);



  // const rootElement2 = document.getElementById('root');
  // const guiComponent2 = new ION.GUIComponent({
  //   rootElement: rootElement2,
  //   ratio: 1,
  // });
  // guiComponent2.position.y = 5;
  // guiComponent2.position.x = 4;
  // guiComponent2.rotateY(-0.3);

  // /* Entity */
  // let guiEntity2 = new ION.Entity();
  // guiEntity2.addComponent(guiComponent2);
  // engine.addEntity(guiEntity2);




  /* System */
  const guiSystem = new ION.GUISystem();
  engine.addSystem(guiSystem);
  
  /* Engine Start */
  engine.start();


  const unit = 0.1;

  // x -> towards x
  // y -> towards y
  // z -> towards z

});



