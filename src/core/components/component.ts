import * as THREE from 'three';


// enum TYPE {
//     up = 1,
// }


interface NamedParameters {
    type: string;
}


export abstract class Component extends THREE.Object3D{
    type: string;
    state: any; // additional to Object3D props


    constructor({type=null}: NamedParameters){
        super();

        this.type = type;
        this.state = {};
    }
    

    abstract initComponent (props: any): void;


    abstract registerComponent (props: any): void;

    // Not using this and trying to mutate state directly to update references to state values without writing logic to set them...
    // public setState = (newState: any): any => {
    //     this.state = {...this.state, ...newState}; // second one overwrites...
    // }
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
