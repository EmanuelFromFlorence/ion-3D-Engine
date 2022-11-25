import * as THREE from 'three';



/* ================================== ThreeJS Geometry helper functions ================================== */

/* vertMap, posMap */
// Reminder: vertMap needs to be updated too after changing positions directly
// p is the index to query position...
export const getGeometryMaps = (positionAttr) => {
    let vertMap = new Map(); // Using Map() to have any key type (not only string or Symbol for objects...)

    /* posMap */
    for ( let p = 0, l = positionAttr.count; p < l; p ++ ) {
        const posVector = new THREE.Vector3().fromBufferAttribute( positionAttr, p );
        let vertKey = getVectorStr(posVector);
        if (vertMap.get(vertKey)) {
            // If already exists so just add to its array
            vertMap.get(vertKey).push(p); // no need to reassign
        }else{
            vertMap.set(vertKey, [p]);
        }
    }

    /* posMap */
    let posMap = new Map();
    for ( let p = 0, l = positionAttr.count; p < l; p ++ ) {
        const posVector = new THREE.Vector3().fromBufferAttribute( positionAttr, p );
        let vertKey = getVectorStr(posVector);
        let samePositions = vertMap.get(vertKey);
        posMap.set(p, samePositions);
    }

    return [vertMap, posMap];
}


export const getVectorStr = (v: THREE.Vector3) => {
    // TODO:: precision (maybe also as a param...later)
    return v.x.toFixed(12) + ',' + v.y.toFixed(12) + ',' + v.z.toFixed(12);
}


export const setVertexPosition = (x, y, z, positionAttr, posMap, p) => {
    // let vector = new THREE.Vector3(x, y, z);
    for (let pp of posMap.get(p)){
        positionAttr.setX(pp, x);
        positionAttr.setY(pp, y);
        positionAttr.setZ(pp, z);
    }
    return positionAttr;
}


export const getVectorByP = (p, positionAttr) => {
    return new THREE.Vector3().fromBufferAttribute( positionAttr, p );
}



/* ==================================  ================================== */


export const convertToWireframeGeometry = (mesh) => {
    /* WireframeGeometry */
    const wireframe = new THREE.WireframeGeometry( mesh.geometry );
    let lineMesh = new THREE.LineSegments( wireframe );
    lineMesh.material.depthTest = false;
    lineMesh.material.opacity = 0.25;
    lineMesh.material.transparent = true;
    lineMesh.position.x = mesh.position.x + 100;
    // new THREE.BoxHelper( lineMesh ) 
    return lineMesh;
}


export const convertToEdgeGeometry = (mesh) => {
    const EdgesGeometry = new THREE.EdgesGeometry( mesh.geometry );
    let lineMesh = new THREE.LineSegments( EdgesGeometry );
    lineMesh.material.depthTest = false;
    lineMesh.material.opacity = 0.25;
    lineMesh.material.transparent = true;
    lineMesh.position.x = mesh.position.x + 100;
    return lineMesh;
}






