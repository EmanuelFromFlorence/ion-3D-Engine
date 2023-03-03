
<div align="center">
	<img src="docs/logo_0.png" alt="ion 3D Engine"/>
	<p>A <b>Javascript</b> library for building 3D websites and virtual reality experiences.</p>
</div>


---

**Table of contents:**


<!-- TOC -->

- [Introduction](#introduction)
- [Installation](#installation)
- [Fundamentals](#fundamentals)
- [Getting started](#getting-started) 
	- [GUI Components](#gui-components) 
- [Examples](#examples) 
- [API Reference](https://github.com/samrun0/ion-3D-Engine/wiki/API-Reference) 
- [Roadmap and Contributing](https://github.com/samrun0/ion-3D-Engine/wiki/Roadmap-and-Contributing) 

<!-- /TOC -->


Please visit ion-3D-Engine [wiki](https://github.com/samrun0/ion-3D-Engine/wiki) for the full documentation!




## Introduction

Demo



A simple and easy to use library to create 3D user interfaces that is also capable to be lauched in VR headsets. This library is powered by [Three.js](https://threejs.org/). As a result, the Scene Hierarchy, Meshes (components here), and Materials are all Three.js objects and the [API](https://github.com/samrun0/ion-3D-Engine/wiki/API-Reference) is consistent with Three.js API. Your components can also be integrated into your existing Three.js scene.





## Installation

ion 3D Engine is available as an [npm package](https://www.npmjs.com/package/ion-3d-engine).

```sh
npm install ion-3d-engine
```

This library depends on Three.js:

```sh
npm install three
```


## Getting started



### GUI Components

There are only a few steps to setup the engine and render HTML in a 3D scene:

- **Step 1:** create an instance of ION Engine:
- **Step 2:** create a GUI component with a `rootElement` and add it to an entity. The HTML element is root of the DOM tree that we want to render in 3D.
- **Step 3:** add the GUI system and start the engine.


```js
/* Engine */
const engine = new ION.Engine({
    canvas: canvas,
    fullScreen: true,
    control: ION.SpaceControl, 
    vrEnabled: true,
});

/* GUI Component */
const rootElement = document.getElementById('sample');
const guiComponent = new ION.GUIComponent({
    rootElement: rootElement,
    ratio: 0.5,
    transparent: true,
});

/* Entity */
const guiEntity = new ION.Entity();
guiEntity.addComponent(guiComponent);
engine.addEntity(guiEntity);

/* System */
const guiSystem = new ION.GUISystem();
engine.addSystem(guiSystem);
 
/* Engine Start */
engine.start();

```


ion Engine API is consistent with ThreeJS API so you can simply add the GUI components to your existing ThreeJS scene. 

```js
/* Renderer: */
const canvas = document.querySelector('#viewport');
const renderer = new THREE.WebGLRenderer({canvas});
renderer.setSize( window.innerWidth, window.innerHeight );

/* Scene: */
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xffffff );

/* Camera: */
const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 5);

/* Render: */
function render(time) {
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}
requestAnimationFrame(render);
```






## Fundamentals


### Entity-component-system (ECS)

ion Engine is based on [entity-component-system (ECS)](https://en.wikipedia.org/wiki/Entity_component_system) architecture which is a popular and powerful pattern to develop 3D applications. The building blocks of this model are:

- **Components:** they are encapsulated data holders and decoupled from the application logic. Components can be attached to entities to describe their attributes and how to be treated by the systems.

- **Entities:** each entity represents a different conceptual object with the desired components in the 3D scene. For example, an entity with a GUI component can be rendered as a 3D user interface.

- **Systems:** a system is a process which acts on the entities. For example, a GUI system queries the entities with a GUI Component and handles the GUI related operations and renders them into the 3D scene.



### ion Engine and ThreeJS





## Examples







## API Reference







```js
// mod.cjs
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
```






| Example | Demo |
| --- | --- |
| git status | List all new or modified files |
| git diff | Show file differences that haven't been staged |



