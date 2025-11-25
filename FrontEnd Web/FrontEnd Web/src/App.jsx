import { useState } from 'react'
import { ToastContainer } from 'react-toastify'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Signup,Login,Profile,VerifyEmail,ForgetPassword } from "./Autenticacion/components"
import ResetPassword from './Autenticacion/components/resetPassword'
import AgendamientoDashboard from './Agendamiento/pages/AgendamientoDashboard'
import MisCitas from './Agendamiento/pages/MisCitas'
import GestionServicios from './Agendamiento/pages/GestionServicios'
import GestionDisponibilidad from './Agendamiento/pages/GestionDisponibilidad'
import GestionCitasProveedores from './Agendamiento/pages/GestionCitasProveedor'
import Navbar from './components/Navbar'
import { AuthProvider } from './Agendamiento/contexts/AuthContext'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Router>
        <AuthProvider>
        <ToastContainer />
        <Navbar /> 
          <Routes>
            {/* Rutas de Autenticación */}
            <Route path='/signup' element={<Signup />} />
            <Route path='/login' element={<Login />} />
            <Route path='/dashboard' element={<Profile />} />
            <Route path='/otp/verify' element={<VerifyEmail />} />
            <Route path='/forget_password' element={<ForgetPassword />} />
            <Route path='/api/v1/auth/password-reset-confirm/:uid/:token' element={<ResetPassword />} />
            
            {/* Rutas de Agendamiento */}        
            <Route path='/agendamiento-dashboard' element={<AgendamientoDashboard />} />
            <Route path='/mis-citas' element={<MisCitas />} />
            <Route path='/servicios' element={<GestionServicios />} />
            <Route path='/disponibilidad' element={<GestionDisponibilidad />} />
            <Route path='/gestion-citas' element={<GestionCitasProveedores />} />
          </Routes>
        </AuthProvider>
      </Router>
    </>
  )
}

export default App
