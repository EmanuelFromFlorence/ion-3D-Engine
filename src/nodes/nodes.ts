import { createSlice, configureStore } from '@reduxjs/toolkit'
import { loadGLTF } from '../io/loader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
import { getGeometryMaps } from './geometry-utils';



// function getRandomInt(min: number, max: number) {
//     min = Math.ceil(min);
//     max = Math.floor(max);
//     return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
// }

// function genNodeId(type: string): string{
//     return type + '__' + getRandomInt(10000, 1000000000);
// }



class NodeEngine{
    private store: any;

    constructor(){
        this.store = this.initStore();
        
    }

    initStore = () => {
        return {
            nodes: [],
        };
    }

    
    loadGLTF = (url: string) => {

        const loader = new GLTFLoader();
        // (url, onLoad, onProgress, onError)
        loader.load(url, (gltf: any) => {
            this.createGLTFInputNodes(gltf);
            
            gltf.animations; // Array<THREE.AnimationClip>
            gltf.scene; // THREE.Group
            gltf.scenes; // Array<THREE.Group>
            gltf.cameras; // Array<THREE.Camera>
            gltf.asset; // Object

            // this.mixer = new THREE.AnimationMixer( gltf.scene );
            // gltf.animations.forEach((clip) => {
            //     console.log('heeeee');
            //     this.mixer.clipAction( clip ).play();
            // });

            // gltf.scene.position.set(0,-4,0);

            // const mesh = gltf.scene.children[0];
            // const fooExtension = mesh.userData.gltfExtensions.EXT_foo;

            // gltf.parser.getDependency( 'bufferView', fooExtension.bufferView )
            //     .then( function ( fooBuffer ) { ... } );

            }, function ( xhr ) {
                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
            },
            function ( error ) {
                console.log( 'An GLTF error happened: ' );
                console.log(error);
            }
        );
    }

    createGLTFInputNodes = (gltf: any): void => {
        // also create and assign node and scene child/parent relationships
        // console.log(gltf);

        // for (let child of gltf.scene.children) {  this is not traversing all children (boundary)!!! 
        gltf.scene.traverse((child: any) => {
            // child.geometry
            let meshName = child.userData.name;
            // console.log(meshName);
            if (child.isMesh){                
                let meshInputNode = new MeshInputNode(child);

            }
        });


    }

    
    /* ================ actions ================ */

    addNode = (node: any): void => {
        this.store.nodes.push(node);
    }

    
    /* ================ selectors ================ */

    // getNodeById = (nodeId: string): AbstractNode => {
    //     return this.store.nodes[nodeId];
    // }


}




type NodeLink = { // or interface
    index: number;
    port: string;
}







abstract class AbstractNode{
    inputPorts: {[index: string]: NodeLink};
    outputPorts: {[index: string]: NodeLink};
    nodeType: string;

    constructor(){
        this.inputPorts = {};
        this.outputPorts = {};
        this.nodeType = new.target.name;
    }

    abstract initPorts: () => void;

    abstract initNode: () => void;
    

    // connectOutputTo = (node: AbstractNode,) => {
    //     // this.outputPorts
    // }
}



/* ========================================== Input Nodes ========================================== */

abstract class AbstractInputNode extends AbstractNode {
    constructor(){
        super();
    }
}


// class GLTFInputNode extends AbstractInputNode{
//     constructor(){
//         super();
//         this.initPorts();
//     }

//     initPorts = () => {
//         this.inputPorts = {};
//         this.outputPorts = {
//             geometry: null, // {index: 10, port: 1}
//         };
//     }
// }


class MeshInputNode extends AbstractInputNode {
    mesh: THREE.Mesh;
    
    constructor(mesh: THREE.Mesh = null){ // THREE.3DObject
        super();
        this.initPorts();
        this.initNode();
        this.setInputMesh(mesh);
    }


    initPorts = () => {
        this.inputPorts = {};
        this.outputPorts = {
            geometry: null, // {index: 10, port: 1}
        };
    }


    initNode = () => {
        
    }


    setInputMesh = (mesh: THREE.Mesh) => {
        this.mesh = mesh || null;
        if(mesh){
            console.log('mesh:');
            
            console.log(mesh);

            let positionAttr = mesh.geometry.getAttribute('position');
            let normalAttr = mesh.geometry.getAttribute('normal');
            let indexAttr = mesh.geometry.index;
            // console.log(positionAttr);
            
            // let [vertMap, posMap] = getGeometryMaps(positionAttr);
            // console.log(vertMap);
            
            // console.log(positionAttr.getY(23));
            console.log(`positionAttr=`);
            // positionAttr.setX(0, 10);
            console.log(positionAttr);
            
            console.log(`indexAttr=`);
            console.log(indexAttr);

            let l = [];
            for (let i=0; i<10000; i++){
                l.push(getBox1());

            }
            console.log('Done');
            console.log(l);
            
        }

    }


}

function getBox1(){
    const width = 1;  // ui: width
    const height = 1;  // ui: height
    const depth = 1;  // ui: depth
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshPhongMaterial({color: 0x44aa88, wireframe: true});  // greenish blue
    const mesh = new THREE.Mesh(geometry, material);

    return mesh;
}


/* =================================================================================================== */







class TransformNode extends AbstractNode{
    initNode: () => void;

    constructor(){
        super();
    }

    initPorts = () => {
        this.inputPorts = {
            geometry: null,
        };
        this.outputPorts = {
            geometry: null,
        };
    }

}



export function runEngine(){

    let nodeEngine = new NodeEngine();

    // let meshInputNode = new MeshInputNode();
    // console.log('Created meshInputNode: nodeId=' + meshInputNode.nodeType);
    
    nodeEngine.loadGLTF('resources/Box.gltf');


    // nodeEngine.addNode(meshInputNode);
    // console.log('Node added - state:');
    // console.log(nodeEngine.getState());
    // console.log('meshInputNode by id:');
    // console.log(nodeEngine.getNodeById(meshInputNode.nodeId));
}



















abstract class AbstractInputPort {

    constructor(){
        
    }


    
}
























// // const counterSlice = createSlice({
// //     name: 'counter',
// //     initialState: {
// //       value: 0
// //     },
// //     reducers: {
// //       incremented: state => {
// //         // Redux Toolkit allows us to write "mutating" logic in reducers. It
// //         // doesn't actually mutate the state because it uses the Immer library,
// //         // which detects changes to a "draft state" and produces a brand new
// //         // immutable state based off those changes
// //         state.value += 1
// //       },
// //       decremented: state => {
// //         state.value -= 1
// //       }
// //     }
// // });

// // export const { incremented, decremented } = counterSlice.actions

// // const store = configureStore({
// //   reducer: counterSlice.reducer
// // })

// // // Can still subscribe to the store
// // store.subscribe(() => console.log(store.getState()))

// // // Still pass action objects to `dispatch`, but they're created for us
// // store.dispatch(incremented())
// // // {value: 1}
// // store.dispatch(incremented())
// // // {value: 2}
// // store.dispatch(decremented())
// // // {value: 1}


// function getRandomInt(min: number, max: number) {
//     min = Math.ceil(min);
//     max = Math.floor(max);
//     return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
// }

// function genNodeId(type: string): string{
//     return type + '__' + getRandomInt(10000, 1000000000);
// }



// class NodeEngine{
//     store: any;
//     NodeEngineSlice: any;
//     addNodeAction: any;

//     constructor(){
//         this.NodeEngineSlice = createSlice({
//             name: 'NodeEngineSlice',
//             initialState: {
//                 nodes: {}
//             },
//             reducers: {
//                 addNodeAction: (state, action) => {
//                     // It uses the Immer library internally.
//                     // state.value += 1
//                     console.log('adding the new node payload::::');
//                     console.log(action.payload);
                    
                    
//                     state.nodes[action.payload.nodeId] = action.payload;
//                 },
//             }
//         });
        
//         const { addNodeAction } = this.NodeEngineSlice.actions;
//         this.addNodeAction = addNodeAction;
        
//         this.store = configureStore({
//             reducer: this.NodeEngineSlice.reducer
//         });
        
//         // Can still subscribe to the store
//         this.store.subscribe(() => console.log(this.store.getState()));

        
//     }

    
    


//     getState = () => {
//         return this.store.getState();
//     }


    
//     /* ================ actions ================ */

//     addNode = (node: any) => {
//         return this.store.dispatch(this.addNodeAction(node));
//     }


//     /* ================ selectors ================ */

//     getNodeById = (id: string) => {
//         // console.log(this.getState().nodes);
        
//         return this.getState().nodes[id];
//     }


// }







// abstract class AbstractNode{
//     inputPorts: object;
//     outputPorts: object;    
//     nodeId: string;

//     constructor(){
//         this.inputPorts = {};
//         this.outputPorts = {};
//         this.nodeId = genNodeId(new.target.name);
//     }

//     // connectOutputTo = (node: AbstractNode, ) => {
//     //     // this.outputPorts
//     // }
// }


// abstract class AbstractInputNode extends AbstractNode {
//     constructor(){
//         super();
//     }    
// }


// class MeshInputNode extends AbstractInputNode {
//     constructor(){
//         super();
//     }
// }



// class TransformNode extends AbstractNode{
//     constructor(){
//         super();
//     }
// }



// export function run(){

//     let nodeEngine = new NodeEngine();

//     let meshInputNode = new MeshInputNode();
    
//     console.log('Created meshInputNode: nodeId=' + meshInputNode.nodeId);
    
//     nodeEngine.addNode(meshInputNode);
//     console.log('Node added - state:');
//     console.log(nodeEngine.getState());
//     console.log('meshInputNode by id:');
//     console.log(nodeEngine.getNodeById(meshInputNode.nodeId));
    
// }



