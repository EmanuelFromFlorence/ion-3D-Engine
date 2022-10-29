import logo from './logo.svg';
import './App.css';
import {run} from '../../../src/3d-node-engine'

function App() {
  // throw new Error('eeerr');

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
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

// This runs after before rendering react components 
run();

export default App;
