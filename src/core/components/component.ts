import * as THREE from 'three';


// enum TYPE {
//     up = 1,
// }


interface NamedParameters {
    type: string;
}


export class Component extends THREE.Object3D{
    type: string;
    state: any; // additional to Object3D props


    constructor({type=null}: NamedParameters){
        super();

        this.type = type;
    }
    
    
    public setState = (state: any): any => {
        this.state = state;
    }
}


export class CustomComponent{
    type: string;
    schema: any;


    constructor({type=null}: NamedParameters){
        this.type = type;
    }
    
    
    public setSchema = (schema: any): any => {
        this.schema = schema;
    }
}
