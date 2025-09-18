import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx' // '.jsx'가 아닌 '.tsx'를 임포트
import './index.css'

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Failed to find the root element with id 'root'");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
