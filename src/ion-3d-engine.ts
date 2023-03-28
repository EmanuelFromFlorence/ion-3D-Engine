import { Engine } from './engine/engine';
import { Entity } from './core/entity';
import { showLoadingScreen, hideLoadingScreen } from './core/utils/utils';
import { GUIComponent } from './gui/gui-component';
import { GUISystem } from './gui/gui-system';
import { getTemplateScene } from './nodes/utils';
import { positionInFront } from './engine/utils';
import { zIndex, 
        GUI_COMPONENT_TYPE,
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
        positionInFront,
        showLoadingScreen,
        hideLoadingScreen,

        // Constants:
        zIndex,
        GUI_COMPONENT_TYPE,
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
export { positionInFront };
export { showLoadingScreen, hideLoadingScreen };
export { zIndex,
        GUI_COMPONENT_TYPE,
        SpaceControl,
        FirstPersonControl, 
        ArcBallControl,
        FlyControl, };


export default ION;
