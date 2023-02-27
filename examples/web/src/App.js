// import logo from './logo.svg'; // svg image not working
import './App.css';
import * as ION from '../../../src/ion-3d-engine'
import { useEffect, useRef } from 'react';

function App() {
  return (
    <div className="App">

      <header className="App-header">
        <img id='logo' src="logo512.png" className="App-logo" alt="logo" />
        
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
