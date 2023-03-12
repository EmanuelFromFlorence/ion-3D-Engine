import { Component } from './components/component';
import * as THREE from 'three';


interface NamedParameters {
    // name: string;
}


export class Entity{
    components: any; // Map<string, Component>;
    id: any;
    name: string;
    

    constructor(){ // {}: NamedParameters
        this.id = THREE.MathUtils.generateUUID();
        // this.components = new Map();
        // this.name = name;
        this.components = {};
    }
    

    public addComponent = (component: Component): any => {
        // this.components.set(component.compType, component);
        this.components[component.compType] = component;
    }


    public getComponent = (compType: string): Component => {
        // return this.components.get(compType);
        return this.components[compType];
    }

}

