import { Engine } from "../../ion-3d-engine";


interface NamedParameters {
}


export abstract class System{

    
    constructor(){ //{}: NamedParameters
        
    }
    

    public abstract execute: (engine: Engine, entityRegistry: any) => void;

}
