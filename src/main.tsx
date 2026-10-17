import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import RegistrationPage from './components/RegistrationPage'
import './styles/global.css'

const basePath = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`
const currentPath = window.location.pathname.startsWith(basePath)
  ? `/${window.location.pathname.slice(basePath.length)}`
  : window.location.pathname
const page = currentPath.replace(/\/+$/, '') === '/register' ? <RegistrationPage /> : <App />

createRoot(document.getElementById('root')!).render(
  <StrictMode>{page}</StrictMode>,
)
