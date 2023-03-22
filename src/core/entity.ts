import { Component } from './components/component';
import * as THREE from 'three';


interface EntityInterface {
    name: string;
}


export class Entity{
    components: any; // Map<string, Component>;
    id: string;
    name: string;
    

    constructor({
        name = '',
    }: EntityInterface = {
        name: '',
    }){
        this.id = THREE.MathUtils.generateUUID();
        this.name = (typeof name === 'string') ? name: '';
        this.components = {};
    }
    

    public addComponent = (component: Component): void => {
        this.components[component.compType] = component;
    }


    public getComponent = (compType: string): Component => {
        return this.components[compType];
    }

}
