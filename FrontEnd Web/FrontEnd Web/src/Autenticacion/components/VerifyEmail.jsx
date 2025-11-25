import React, {useState} from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import '../../styles/Verifyemail.css';
import candadoImg from '../../img/candado.png';
const VerifyEmail = () => {
  const [otp, setOtp] = useState("")
  const navigate = useNavigate()


  const handleSumbit = async (e) =>{
    e.preventDefault()
    if (otp) {
      const response = await axios.post("http://127.0.0.1:8000/api/v1/auth/verify-email/", {'otp':otp})
      if (response.status === 200) {
        navigate("/login")
        toast.success(response.data.message)
      }
    }
  }

  return (
<div className="otp-page-container">
  {/* Contenedor de la Imagen */}
<div className="otp-image-container">
    <img src={candadoImg} alt="Logo o Ilustración" className="otp-top-image" />
</div>
  <div className="otp-card-wrapper">
      <form onSubmit={handleSumbit} className="otp-form-group">
          <div className="otp-input-container">
              <label className="otp-label">Ingresa el código de seguridad</label>
              <input
                type="text"
                name="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="otp-input-field"
              />
          </div>

          <input
            type="submit"
            value="Enviar"
            className="otp-submit-button"
          />
        </form>
      </div>
    </div>
  )
}

export default VerifyEmail