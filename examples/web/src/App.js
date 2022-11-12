// import logo from './logo.svg'; // svg image not working
import './App.css';
import * as ION from '../../../src/ion-3d-engine'
import { useEffect, useRef } from 'react';

function App() {
  const useEffectOnceRef = useRef(false);

  useEffect(() => {
    if (useEffectOnceRef.current) return; // running useEffect only once
    useEffectOnceRef.current = true;



    





    // let canvasElement = document.getElementById('viewport');
    // let templateScene = new ION.TemplateScene({canvas: canvasElement});

    // let ionGUI = new ION.GUI();





    // run();

    // var node = document.getElementsByClassName('App-header')[0];

    // node.addEventListener('click', async (event) => {
    //     event.target.style.backgroundColor = '#fb61a9';    
    //     console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++++ onmouseover Fired');
    // });

    
    // console.log(document.elementFromPoint(100, 100));



    let id = setTimeout(() => {
      var node = document.getElementsByClassName('App-header')[0];
      let linkie = document.getElementsByClassName('App-link')[0];
      // var rect = linkie.getBoundingClientRect();
      // console.log(rect.top, rect.right, rect.bottom, rect.left);
      // console.log(linkie.offsetLeft, linkie.offsetTop);
      // 0, linkie.offsetLeft, linkie.offsetTop, linkie.offsetLeft, linkie.offsetTop,
      // console.log(node.scrollWidth, node.scrollHeight);

      


      /* WORKS:::: */
      // var event = document.createEvent("MouseEvents");
      // event.initMouseEvent("click", true, true, window,
      
      //     0, 585.2171200461877 ,148.87941317293198, 585.2171200461877 ,148.87941317293198, 
      //     false, false, false, false,
      //     0, null);
        
      //     linkie.dispatchEvent(event);




      /* WORKS:::: */
      // // https://stackoverflow.com/questions/6157929/how-to-simulate-a-mouse-click-using-javascript
      // function simulatedClick(target, options) {

      //   var event = target.ownerDocument.createEvent('MouseEvents'),
      //       options = options || {},
      //       opts = { // These are the default values, set up for un-modified left clicks
      //         type: 'click',
      //         canBubble: true,
      //         cancelable: true,
      //         view: target.ownerDocument.defaultView,
      //         detail: 1,
      //         screenX: 0, //The coordinates within the entire page
      //         screenY: 0,
      //         clientX: 0, //The coordinates within the viewport
      //         clientY: 0,
      //         ctrlKey: false,
      //         altKey: false,
      //         shiftKey: false,
      //         metaKey: false, //I *think* 'meta' is 'Cmd/Apple' on Mac, and 'Windows key' on Win. Not sure, though!
      //         button: 0, //0 = left, 1 = middle, 2 = right
      //         relatedTarget: null,
      //       };
      
      //   //Merge the options with the defaults
      //   for (var key in options) {
      //     if (options.hasOwnProperty(key)) {
      //       opts[key] = options[key];
      //     }
      //   }
      //   // console.log(opts);
      
      //   //Pass in the options
      //   event.initMouseEvent(
      //       opts.type,
      //       opts.canBubble,
      //       opts.cancelable,
      //       opts.view,
      //       opts.detail,
      //       opts.screenX,
      //       opts.screenY,
      //       opts.clientX,
      //       opts.clientY,
      //       opts.ctrlKey,
      //       opts.altKey,
      //       opts.shiftKey,
      //       opts.metaKey,
      //       opts.button,
      //       opts.relatedTarget
      //   );
      
      //   //Fire the event
      //   target.dispatchEvent(event);
      // }
  
  
      // for (let i=0; i<1500; i++){
      //   simulatedClick(node, {
      //     type: 'click',
      //     screenX: i, //The coordinates within the entire page
      //     screenY: i,
      //     clientX: i, //The coordinates within the viewport
      //     clientY: i,
      //   });
      // }

      // simulatedClick(linkie, {
      //   type: 'mouseup',
      // });







      // let linkie = document.getElementsByClassName('App-link')[0];
      //   console.log('Linkie:::');
      //   console.log(linkie);

        // linkie.click();
        // linkie.focus();

      // var node = document.getElementsByClassName('App-header')[0];
      // node.click();


        // var event = document.createEvent("MouseEvents");
        // event.initMouseEvent("click", true, true, window,
        //     0, 0, 0, 0, 0,
        //     false, false, false, false,
        //     0, null);
          
        // linkie.dispatchEvent(event);


        // linkie.addEventListener('mousedown', ()=>{
        //   console.log('Event');
        // });

      // const mouseEvent0 = new MouseEvent("mousedown", {
      //   screenX: 10,
      //   screenY: 10,
      //   clientX: 10,
      //   clientY: 10,

      //   view: window,
      //   bubbles: true,
      //   cancelable: true,
      //   // composed: true,
      // });
      // linkie.dispatchEvent(mouseEvent0);

      // const mouseEvent1 = new MouseEvent("mouseup", {
      //   screenX: 10,
      //   screenY: 10,
      //   clientX: 10,
      //   clientY: 10,

      //   view: window,
      //   bubbles: true,
      //   cancelable: true,
      //   // composed: true,
      // });
      // linkie.dispatchEvent(mouseEvent1);
    


      
      let elements = document.elementsFromPoint(30, 20);
      console.log(elements);



      return clearTimeout(id);
    }, 1000);






  }, []);



  return (
    <div className="App">

      <header className="App-header">
        {/* <img src={logo} className="App-logo" alt="logo" /> */}
        <img src="logo512.png" className="App-logo" alt="logo" />
        
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>



    <div className="outer">
      <div className="inner">
        <div className="log">
          <p>
            Offset-relative: <span id="offsetX">0</span>,
            <span id="offsetY">0</span>
          </p>
          <p>
            Client-relative: <span id="clientX">0</span>,
            <span id="clientY">0</span>
          </p>
          <p>
            Page-relative: <span id="pageX">0</span>,
            <span id="pageY">0</span>
          </p>
          <p>
            Screen-relative: <span id="screenX">0</span>,
            <span id="screenY">0</span>
          </p>
        </div>
      </div>
    </div>

    </div>
  );
}

// // This runs after before rendering react components 
// run();




export default App;
