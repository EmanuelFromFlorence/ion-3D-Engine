import { Component } from './components/component';
import * as THREE from 'three';


interface NamedParameters {
    name: string;
}


export class Entity{
    components: Component[];
    id: any;
    name: string;
    
    
    constructor({name=null}: NamedParameters){
        this.id = THREE.MathUtils.generateUUID();
        this.name = name;
    }
    

    public addComponent = (component: Component): any => {
        this.components.push(component);
    }

}

