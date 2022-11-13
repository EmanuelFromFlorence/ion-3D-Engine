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


console.log('In index.js....');



window.addEventListener('load', () => {
  // const htmlElement = document.getElementById('container');
  // htmlElement.style.position = 'fixed';
  // htmlElement.style.left = '0';
  // htmlElement.style.top = '0';

  /* Engine */
  const canvas = document.getElementById('viewport');
  canvas.style.zIndex = 100000;
  canvas.style.position = 'fixed';
  canvas.style.display = 'block';
  canvas.style.width = '100%'; // `${window.innerWidth}px`;
  canvas.style.height = '100%'; //`${window.innerHeight}px`; // clientHeight
  let guiScene = ION.createGUIScene();
  const engine = new ION.Engine(canvas, guiScene);

  // /* Component */
  // const htmlElement = document.getElementById('root');
  // // should do these in GUIComponent init step:
  // htmlElement.style.position = 'fixed';
  // htmlElement.style.width = `512px`;
  // htmlElement.style.height = `512px`;
  // htmlElement.style.overflow = 'hidden'; // This will not allow the content to exceed the container
  // // htmlElement.style.overflow = 'auto'; // This will automatically add scrollbars to the container when...
  // htmlElement.style.margin = '0 auto';

  const htmlElement = document.getElementById('container');

  const guiComponent = new ION.GUIComponent({
    htmlElement: htmlElement,
    ratio: 1,
  });
  guiComponent.position.y = 5;
  // guiComponent.position.z = -10;

  /* Entity */
  let guiEntity = new ION.Entity();
  guiEntity.addComponent(guiComponent);
  engine.addEntity(guiEntity);

  /* System */
  const guiSystem = new ION.GUISystem();
  engine.addSystem(guiSystem);
  
  /* Engine Start */
  engine.start();



  // let id = setTimeout(() => {
  //   engine.start();
  // }, 1000);
  
});



