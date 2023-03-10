import { Engine } from './engine/engine';
import { Entity } from './core/entity';
import { showLoadingScreen, hideLoadingScreen } from './core/utils/utils';
import { GUIComponent } from './gui/gui-component';
import { GUISystem } from './gui/gui-system';
import { getTemplateScene } from './nodes/utils';
import { zIndex, 
        SpaceControl, 
        FirstPersonControl, 
        ArcBallControl, 
        FlyControl, } from './core/constants';


const ION = {
        Engine,
        Entity,
        GUIComponent,
        GUISystem,
        getTemplateScene,
        showLoadingScreen,
        hideLoadingScreen,

        // Constants:
        zIndex,
        SpaceControl,
        FirstPersonControl,
        ArcBallControl,
        FlyControl,
};


if ( typeof global !== 'undefined' ) global.ION = ION;
if ( typeof globalThis !== 'undefined' ) globalThis.ION = ION;


export { Engine };
export { Entity };
export { GUIComponent };
export { GUISystem };
export { getTemplateScene };
export { showLoadingScreen, hideLoadingScreen };
export { zIndex,
        SpaceControl,
        FirstPersonControl, 
        ArcBallControl,
        FlyControl, };


export default ION;
