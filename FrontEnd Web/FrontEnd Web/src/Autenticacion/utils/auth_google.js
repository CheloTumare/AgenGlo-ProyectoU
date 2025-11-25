import axios from "axios";
import { toast } from "react-toastify";

export async function handleSignInWithGoogle(response, navigate, login) {
  try {
    const payload = response.credential;
    
    const server_res = await axios.post("http://127.0.0.1:8000/api/v1/auth/google/", {
      access_token: payload
    });

    const user = {
      id: server_res.data.id,
      email: server_res.data.email,
      nombre: server_res.data.full_name,
      is_staff: server_res.data.is_staff
    };

    if (server_res.status === 200) {
      login(user,server_res.data.access_token,server_res.data.refresh_token)
      toast.success("Sesión Iniciada");
      navigate("/dashboard");
    }
  } catch (error) {
    console.error("Error en autenticación con Google", error);
    toast.error("Error al iniciar sesión con Google");
  }
}