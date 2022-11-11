

export const GUI_COMPONENT_TYPE  = 'gui_1000'


// helper for users to setup and get the engine with GUI component and system
export function createGUIEngine(){

}


export function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.crossOrigin = 'anonymous'
      img.decoding = 'sync'
      img.src = url
    })
  }
