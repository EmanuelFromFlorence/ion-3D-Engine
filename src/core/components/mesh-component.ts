import * as THREE from 'three';


interface NamedParameters {
    type: string;
}


export abstract class MeshComponent extends THREE.Mesh {
    type: string;


    constructor({type=null}: NamedParameters){
        const vertices = new Float32Array([]);
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
        const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
        
        super(geometry, material);

        this.type = type;
    }
    

    abstract initComponent (props: any): void;


    abstract registerComponent (props: any): void;


    public setGeometry(geometry: any){
        super.geometry = geometry;
    }


    public getGeometry(){
        return super.geometry;
    }


    public setMeterial(material: any){
        super.material = material;
    }


    public getMaterial(){
        return super.material;
    }


    protected updateTheMorph(){
        super.updateMorphTargets();
    }


    // set geometry(geometry: any){
    //     super.geometry = geometry;
    // }


    // get geometry(){
    //     return super.geometry;
    // }


    // set meterial(material: any){
    //     super.material = material;
    // }


    // get material(){
    //     return super.material;
    // }


    // Not using this and trying to mutate state directly to update references to state values without writing logic to set them...
    // public setState = (newState: any): any => {
    //     this.state = {...this.state, ...newState}; // second one overwrites...
    // }
}
