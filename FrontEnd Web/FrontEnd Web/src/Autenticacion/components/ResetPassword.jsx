import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from "../utils/axiosInstance"
// Importamos los estilos CSS (asegúrate que la ruta sea correcta en tu proyecto)
import '../../styles/ResetPassword.css';

// Componente del Osito Guardián con animación de taparse los ojos
// Utiliza clases CSS para toda la apariencia y la animación de las manitas.
const Mascot = ({ isFocused }) => {

    // Helper para las almohadillas/garritas (Se usa JSX y clases del CSS)
    const HandPadDetails = () => (
        <div className="rp-hand-pads">
            <span className="rp-hand-pad"></span>
            <span className="rp-hand-pad"></span>
            <span className="rp-hand-pad"></span>
        </div>
    );

    return (
        // La clase 'focused' se aplica aquí para activar la animación en CSS
        <div className={`rp-mascot-container ${isFocused ? 'focused' : ''}`}>
            <div className="rp-bear-body">
                {/* Orejas */}
                <div className="rp-bear-ear left"></div>
                <div className="rp-bear-ear right"></div>
                
                {/* CARA: Hocico, Ojos y Nariz (Se esconden al cubrir) */}
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    
                    {/* Hocico y Nariz */}
                    <div className="rp-snout rp-bear-face-element">
                        <div style={{ width: '12px', height: '8px', borderRadius: '50%', backgroundColor: 'black', position: 'absolute', top: '6px', left: '50%', transform: 'translateX(-50%)' }}></div>
                        <div style={{ width: '16px', height: '4px', backgroundColor: 'black', position: 'absolute', bottom: '6px', left: '50%', transform: 'translateX(-50%)', borderRadius: '50%' }}></div>
                    </div>
                    
                    {/* Ojos */}
                    <div className="rp-eye left rp-bear-face-element"></div> 
                    <div className="rp-eye right rp-bear-face-element"></div> 
                </div>

                
                {/* Manitas - Se mueven desde los lados para cubrir los ojos */}
                <div className="rp-hands-wrapper">
                    
                    {/* Manita Izquierda */}
                    <div className="rp-hand left">
                        <HandPadDetails /> 
                    </div>
                    
                    {/* Manita Derecha */}
                    <div className="rp-hand right">
                         <HandPadDetails /> 
                    </div>
                </div>
            </div>
        </div>
    );
};


const ResetPassword = () => {
    const navigate = useNavigate()
    const { uid, token } = useParams()
    const [isInputFocused, setIsInputFocused] = useState(false); 
    const [newPasswords, setNewPasswords]=useState({
        password:'',
        confirm_password:''
    })
const checkFormFocus = () => {
        const passwordInput = document.querySelector('.rp-newpassword');
        const confirmInput = document.querySelector('.rp-conpassword');
        
        const isFocused = document.activeElement === passwordInput || 
                          document.activeElement === confirmInput;
                          
        setIsInputFocused(isFocused);
    };

    const handleFocus = () => setIsInputFocused(true);
    
    // Al desenfocar, esperamos un momento para asegurarnos de que el foco no saltó a otro campo del formulario
    const handleBlur = () => {
        // Espera un tiempo muy breve (10ms) para que el navegador resuelva el siguiente foco
        setTimeout(checkFormFocus, 10);
    };
    const handleOnChange = (e) => {
        setNewPasswords({ ...newPasswords, [e.target.name]: e.target.value });
    };    


    const data = {
        'password': newPasswords.password,
        'confirm_password': newPasswords.confirm_password,
        'uidb64': uid,
        'token': token
    };

    const handleSumbit = async (e) => {
        e.preventDefault()
        // Llamamos a la api
        console.log(data)
        const response = await axiosInstance.patch("/auth/set-new-password/", data)
        const result = response.data
        if (response.status === 200){
            navigate('/login')
            toast.success(result.message)
        }
    }

  return (
    <div className="rp-page"> 
        <div className="rp-wrapper">
            
            {/* El Osito Guardián */}
            <Mascot isFocused={isInputFocused} />

            <h2 className="rp-text">
                Ingresa tu nueva contraseña
            </h2>

            <form onSubmit={handleSumbit} className="rp-submit">
                
                {/* Input 1: Nueva Contraseña */}
                <div className="input-container"> 
                    {/* Usamos 'rp-submit label' como selector en el CSS */}
                    <label className="rp-submit label">Nueva Contraseña:</label>
                    <input
                        type="password"
                        name="password"
                        value={newPasswords.password}
                        onChange={handleOnChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        className="rp-newpassword"
                    />
                </div>

                {/* Input 2: Confirmar Contraseña */}
                <div className="input-container">
                    <label className="rp-submit label">Confirmar Contraseña:</label>
                    <input
                    type="password"
                    name="confirm_password"
                    value={newPasswords.confirm_password}
                    onChange={handleOnChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    className="rp-conpassword"
                    />
                </div>

                <button
                    type="submit"
                    className="rp-change"
                >
                    Cambiar Contraseña
                </button>
            </form>
        </div>
    </div>
  )
}

export default ResetPassword;