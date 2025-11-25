import React, { useState } from 'react'
import axiosInstance from '../utils/axiosInstance'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import '../../styles/Forgetpassword.css';
const ForgetPassword = () => {

const [email, setEmail] = useState(" ")

const handleSumbit = async (e) => {
  e.preventDefault()
  if (email){
    const res = await axiosInstance.post("/auth/password-reset/",{"email":email})
    if (res.status == 200){
      toast.success("Hemos enviado un link a tu Correo")
    }
    console.log(res)
    setEmail("")
  }
}
  return (
<div className="fp-page-container">
  <div className="fp-card-wrapper">
      <h2 className="fp-title">
          Ingresa tu correo electrónico por favor
      </h2>

      <form onSubmit={handleSumbit} className="fp-form-group">
          <div className="fp-input-container">
              <label className="fp-label">Dirección de Correo:</label>
              <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="fp-input-field"
              />
          </div>

          <button
              type="submit"
              className="fp-submit-button"
          >
              Enviar
          </button>
      </form>
  </div>
  </div>
  );
}

export default ForgetPassword