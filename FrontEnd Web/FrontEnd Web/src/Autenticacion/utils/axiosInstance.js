import axios from "axios";
import { jwtDecode } from "jwt-decode";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
const baseUrl = "http://127.0.0.1:8000/api/v1";

const axiosInstance = axios.create({
  baseURL: baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(async (req) => {
  let accessToken = localStorage.getItem('access') ? JSON.parse(localStorage.getItem('access')) : null;
  const refreshToken = localStorage.getItem('refresh') ? JSON.parse(localStorage.getItem('refresh')) : null;

  if (!accessToken) return req;

  const user = jwtDecode(accessToken);
  const isExpired = dayjs.unix(user.exp).diff(dayjs()) < 1;

  if (!isExpired) {
    req.headers.Authorization = `Bearer ${accessToken}`;
    return req;
  }

  // Token expirado, intenta refrescarlo
  try {
    const response = await axios.post(`${baseUrl}/auth/token/refresh/`, {
      refresh: refreshToken,
    });

    const newAccess = response.data.access;
    localStorage.setItem('access', JSON.stringify(newAccess));
    console.log(newAccess)
    req.headers.Authorization = `Bearer ${newAccess}`;
    return req;
  } catch (err) {
    console.error("Token refresh failed", err);

    try {
      await axios.post(`${baseUrl}/auth/logout/`, {
        refresh_token: refreshToken,
      });
    } catch (logoutErr) {
      console.error("Logout failed", logoutErr);
    }

    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    return req;
  }
});

export default axiosInstance;
