import React,{useState, useEffect} from 'react'
import { handleSignInWithGoogle } from '../utils/auth_google'
import { toast } from 'react-toastify'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../Agendamiento/contexts/AuthContext'
import axios from 'axios'
import '../../styles/Login.css';
const Login = () => {
  const imageNames = ["1.png","2.png","3.png","4.png","5.png","6.png", "7.png", "8.png", "9.png", "10.png"];
  const imagePathPrefix = "../src/img/login/";
    // Definimos un array para generar las tres columnas
  const columnNames = [1, 2, 3, 4, 5]; // Para tus tres columnas
  const { login } = useAuth()
  const navigate = useNavigate()
  const [logindata, setLoginData] = useState({
    email:"",
    password:""
  })

  const [error, setError] = useState("")
  const [isLoading,setIsLoading] = useState(false)

  useEffect(() => {
      /* Google global*/
      google.accounts.id.initialize({
        client_id:import.meta.env.VITE_CLIENT_ID,
        callback:(response) => handleSignInWithGoogle(response,navigate,login)
      });
      google.accounts.id.renderButton(
        document.getElementById("signInDiv"),
        {theme:"outline",size:"large",text:"continue_with",shape:"circle",width:"230"}
      )
    }, [navigate, login]);

  const handleOnChange = (e) => {
    setLoginData({...logindata, [e.target.name]:e.target.value})
  }

  const handleSumbit = async (e)=>{
    e.preventDefault()
    const {email, password} = logindata
    if (!email || !password){
      setError("Email y contraseña son requeridos")
    } else {
      setIsLoading(true)
      const res = await axios.post("http://127.0.0.1:8000/api/v1/auth/login/", logindata)
      const response = res.data
      setIsLoading(false)
      const user = {
        "id": response.id,
        "email": response.email,
        "nombre": response.full_name,
        "is_staff": response.is_staff
      }
      if (res.status === 200) {
        login(user,response.access_token,response.refresh_token)
        navigate("/dashboard")
        toast.success("Sesion Iniciada")
      }

    }
  }

  return (
<div className="login-page">
      <div className="carousel-container"> {/* Nuevo contenedor para las columnas carrusel */}
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
      <div className="login-wrapper">
        <div className="login-form-box"><h2 className="login-title">Iniciar Sesión</h2>
        {error && <p className="error-message">{error}</p>}
          <form onSubmit={handleSumbit} className="login-form">
            <div className="input-group">
              <div className="input-container">
                <input 
                type="email" 
                name="email" 
                value={logindata.email} 
                onChange={handleOnChange} 
                className="input-field" 
                disabled={isLoading} 
                id="email-field"/> 
                <label htmlFor="email-field" className="input-label-floating">Correo Electrónico</label>
              </div>
              <div className="input-container">
                <input 
                type="password" 
                name="password" 
                value={logindata.password} 
                onChange={handleOnChange} 
                className="input-field" 
                disabled={isLoading} 
                id="password-field"/>
                <label htmlFor="password-field" className="input-label-floating">Contraseña</label>
              </div>
            </div>   
          <button type="submit" disabled={isLoading} className={`btn-submit ${isLoading ? 'btn-disabled' : ''}`}>
            {/* Contenido del botón: Si está cargando, muestra el spinner y el texto de carga. */}
          {isLoading ? (<>
              {/* El div 'spinner-inside-button' contendrá el spinner animado (ver CSS) */}
          <div className="spinner-inside-button"></div><span>Cargando...</span></>) : ("Enviar")}
            </button>
              <p className="forgot-password-link">
            <Link to="/forget_password">¿Olvidaste tu contraseña?</Link></p>
          </form>
            <div id="signInDiv" className="google-btn-container">
              {/* Aquí va el botón de Google */}
            </div>
            <p className="home-link">
              <Link to="/">Volver A Inicio</Link>
            </p>
        </div>
      </div>
    </div>
  )
}

export default Login