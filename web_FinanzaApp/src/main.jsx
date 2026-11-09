import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/tema.css'
import App from './app/App.jsx'

// El tema guardado se aplica antes del primer render para no parpadear en claro.
document.documentElement.dataset.tema = localStorage.getItem('tema') ?? 'claro'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
