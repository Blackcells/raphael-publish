import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Gate } from './components/Gate'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Gate>
            <App />
        </Gate>
    </StrictMode>,
)