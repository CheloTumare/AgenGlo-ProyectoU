import React, { useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import axiosInstance from '../utils/axiosInstance'
import { toast } from 'react-toastify'
import { useAuth } from '../../Agendamiento/contexts/AuthContext'
import '../../styles/Profile.css';
const Profile = () => {
  const navigate = useNavigate()
  const {user, logout} = useAuth()

  const refresh=JSON.parse(localStorage.getItem('refresh'))

  const handleLogout = async () => {
    const res = await axiosInstance.post("/auth/logout/", {"refresh_token":refresh})
    if (res.status === 200){
      logout()
      navigate("/login")
      toast.success("Te has desconectado")
    }
  }

  return (
    <div className="p-page">
      <div className="p-card-square">
        <div className="p-text-container-top">
      <h2 className="p-text">Bienvenido {user && user.nombre}</h2>
      
      {user?.is_staff ? (
        <p className="p-rol">Soy proveedor</p>
      ) : (
        <p className="p-rol2">Soy cliente</p>
      )}
      {user ? (
      <button
        onClick={handleLogout}
        className="p-button"
      >
        Salir
      </button>
      ) :(
        <p className="p-login-message">
        <span>Inicia sesión</span>
        </p>
      )}
    </div>
    </div>
    </div>
  )
}

export default Profile