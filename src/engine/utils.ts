import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module'

import { zIndex } from '../core/constants';
import { Entity } from "../core/entity";
import { GUIComponent } from "../gui/gui-component";


export function updateEngineStats(engine) {
    if (!engine.engineStats.stats) return;
    engine.engineStats.stats.update();
}


export function createEngineStats(engine) {
    const engineStats = {
        stats: null,
        statsEntity: null,
    };

    const stats = Stats();
    stats.dom.style.zIndex = `${zIndex + 1}`;
    document.body.appendChild( stats.domElement );
    engineStats.stats = stats;

    if(engine.statsOptions && engine.statsOptions.stats3D) {
        const guiComponent = new GUIComponent({
            rootElement: stats.domElement,
            // pixelRatio: 10,
            transparent: false,
            renderTimeout: Infinity,
        });
        guiComponent.rotateX(-0.1);
        guiComponent.position.set(-3, 3, -2);
        
        /* Entity */
        const statsEntity = new Entity();
        statsEntity.addComponent(guiComponent);
        engine.addEntity(statsEntity);
        
        engineStats.statsEntity = statsEntity;
    }
    
    return engineStats;
}


export function positionInFront(camera, mesh, xOffset=0, yOffset=0, zOffset=-6) {
    let cameraDirection = camera.getWorldDirection(new THREE.Vector3());
    cameraDirection.normalize();
    mesh.lookAt(camera.position);

    mesh.matrixAutoUpdate = true;
    mesh.matrixWorldAutoUpdate = true;
    mesh.matrixWorldNeedsUpdate = true;
    
    let offsetVector = new THREE.Vector3(xOffset, yOffset, zOffset);
    offsetVector.applyMatrix4(camera.matrix);
    mesh.position.copy(offsetVector);
    
    // mesh.updateMatrix();
    // mesh.updateMatrixWorld(true);
    // mesh.updateWorldMatrix();
}
