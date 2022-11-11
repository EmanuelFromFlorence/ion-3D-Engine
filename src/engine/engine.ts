import { Component } from "../core/components/component";
import { Entity } from "../core/entity";
import { System } from "../core/systems/system";


class Engine{
    entityRegistry: any;
    systemRegistry: System[];

    
    constructor(){
        this.entityRegistry = {};
    }


    public registerEntity = (entity: Entity): any => {
        for (let compType of entity.components.keys()){
            if (!this.entityRegistry.hasOwnProperty(compType)) {
                this.entityRegistry[compType] = {};
            }
            this.entityRegistry[compType][entity.id] = entity; // overwriting if exists!!
        }
    }


    public registerSystem = (system: System): any => {
        this.systemRegistry.push(system);
    }


    public executeSystems = (): any => {
        for (let system of this.systemRegistry) {
            system.execute(this.entityRegistry);
        }
    }

}
