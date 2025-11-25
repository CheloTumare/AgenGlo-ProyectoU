import React, { useState, useEffect } from 'react'
import { handleSignInWithGoogle } from '../utils/auth_google'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../../Agendamiento/contexts/AuthContext'
import '../../styles/Signup.css';
const Signup = () => {
  const imageNames = ["1.png","2.png","3.png","4.png","5.png","6.png", "7.png", "8.png", "9.png", "10.png"];
  const imagePathPrefix = "../src/img/signup/";
    // Definimos un array para generar las tres columnas
  const columnNames = [1, 2, 3, 4, 5]; // Para tus tres columnas
  const navigate = useNavigate()
  const {login} = useAuth()

  const [formdata, setFormData ] = useState({
    email:"",
    nombre:"",
    apellidos:"",
    password:"",
    password2:"",
  })

  useEffect(() => {
    /* Google global*/
    google.accounts.id.initialize({
      client_id:import.meta.env.VITE_CLIENT_ID,
      callback:(response) => handleSignInWithGoogle(response,navigate,login)
    });
    google.accounts.id.renderButton(
      document.getElementById("signInDiv"),
      {theme:"outline",size:"large",text:"continue_with",shape:"circle",width:"240"}
    )
  }, [navigate,login]);

  const [error, setError] = useState("")

  const handleOnChange = (e)=>{
    setFormData({...formdata, [e.target.name]:e.target.value})
  }

  const handleSumbit = async (e) =>{
    e.preventDefault()
    if (!email || !nombre || !apellidos || !password || !password2 ){
      setError("Todos los campos son requeridos")
    } else {
      console.log(formdata)
      // Llamar a la api (django)
      const res = await axios.post("http://127.0.0.1:8000/api/v1/auth/register/", formdata)
      // Verificar respuesta
      const response = res.data
      if (res.status == 201) {
        // redirect a verificar email
        navigate("/otp/verify")
        toast.success(response.message)
      }

      // server error 
    }
  }

  const {email,nombre,apellidos,password,password2} = formdata

  return (
    <div className="su-page"> {/* Contenedor Principal Centrador */}
        <div className="carousel-container">
            {columnNames.map((column, colIndex) => (
            <div className="carousel-column" key={`column-${colIndex}`}>
                {/* Grupo de cartas para una columna */}
                <div className="group">
                {imageNames.map((name, index) => (
                <div className="card" key={`original-${colIndex}-${index}`}>
                    <img src={`${imagePathPrefix}${name}`} alt={`Icono ${name.split('.')[0]}`} />
                </div>))}
                </div>
                {/* clonado para el efecto infinito vertical */}
                <div className="group" aria-hidden="true">
                {imageNames.map((name, index) => (
                <div className="card" key={`clone-${colIndex}-${index}`}>
                    <img src={`${imagePathPrefix}${name}`} alt={`Icono ${name.split('.')[0]}`} />
                </div>))}
                </div>
            </div>))}
        </div>
        
        {/* su-wrapper es la caja del formulario con el efecto de vidrio */}
        <div className="su-wrapper"> 
            
            {/* 👇 ESTE DIV CON CLASE 'su-page' FUE ELIMINADO 👇 */}
            
            <h2 className="su-title">Crear Cuenta</h2>
            {error && <p className="su-error-message">{error}</p>}
            
            <form className="su-form" onSubmit={handleSumbit}>
                <div className="su-form-row">
                    {/* Campo Nombre */}
                    <div className="su-form-group su-form-group-half">
                        <label className="su-form-label">Nombre</label>
                        <input type="text" name="nombre" value={nombre} onChange={handleOnChange} className="su-form-input"/>
                    </div>
                    {/* Campo Apellidos */}
                    <div className="su-form-group su-form-group-half">
                        <label className="su-form-label">Apellido</label>
                        <input type="text" name="apellidos" value={apellidos} onChange={handleOnChange} className="su-form-input"/>
                    </div>
                </div>
                
                {/* Campo Correo Electrónico - Ancho completo */}
                <div className="su-form-group">
                    <label className="su-form-label">Correo Electrónico</label>
                    <input type="email" name="email" value={email} onChange={handleOnChange} className="su-form-input"/>
                </div>
                
                {/* Campo Contraseña - Ancho completo */}
                <div className="su-form-group">
                    <label className="su-form-label">Contraseña</label>
                    <input type="password" name="password" value={password} onChange={handleOnChange} className="su-form-input"/>
                </div>
                
                {/* Campo Repite Contraseña - Ancho completo */}
                <div className="su-form-group">
                    <label className="su-form-label">Repite Contraseña</label>
                    <input type="password" name="password2" value={password2} onChange={handleOnChange} className="su-form-input"/>
                </div>
                
                {/* Botón de envío */}
                <input type="submit" value="Registrar" className="su-submit-button" />
            </form>

            <div id="signInDiv" className="google-signin-button-wrapper">
                {/* Aquí va el botón de Google */}
            </div>
            <p className="signup-link-container">
                <Link to="/">Volver A Inicio</Link>
            </p>
        </div>
    </div>
  )
}

export default Signup