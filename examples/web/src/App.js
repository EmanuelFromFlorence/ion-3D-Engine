// import logo from './logo.svg'; // svg image not working
import './App.css';
import {run} from '../../../src/3d-node-engine'
import { useEffect } from 'react';

function App() {
  // throw new Error('eeerr');

  useEffect(() => {
    run();
  }, []);

  return (
    <div className="App">
      
      <img rel="prefetch" src="resources/aim.png" alt="." className="aim"></img>

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
    </div>
  );
}

// // This runs after before rendering react components 
// run();

export default App;
