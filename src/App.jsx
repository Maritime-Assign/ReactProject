import { useState } from 'react'
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import PasswordRecovery from "./PasswordRecovery"; // Import new component

function App() {
  const [count, setCount] = useState(0)

  const openNewTab = () => {
    // Open a new tab, which will be handled by React Router for navigation
    window.open('/password-recovery', '_blank');
  };

  return (
    <Router>
    <Routes>
    <Route path="/" element={<div>  
      <div>
          <a href="https://vite.dev" target="_blank">
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>
        <h1>Cloud Chasers</h1>
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
          <button onClick={openNewTab}>Password Recovery</button>
          <p>
            Edit <code>src/App.jsx</code> and save to test HMR
          </p>
        </div>
      

      
        Welcome to Cloud Chasers!</div>
          
        } />
        <Route path="/password-recovery" element={<PasswordRecovery />} />
      </Routes>
    </Router>
  )
}

export default App
