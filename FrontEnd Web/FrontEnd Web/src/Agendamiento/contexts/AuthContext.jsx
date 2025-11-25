import { createContext, useContext } from "react";
import { useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [access, setAccess] = useState(() => {
    const token = localStorage.getItem("access");
    return token ? JSON.parse(token) : null;
  })
    
  const [refresh, setRefresh] = useState(() => {
    const token = localStorage.getItem("refresh");
    return token ? JSON.parse(token) : null;
  })

  const login = (userData, accessToken, refreshToken) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("access", JSON.stringify(accessToken));
    localStorage.setItem("refresh", JSON.stringify(refreshToken));
    setUser(userData);
    setAccess(accessToken);
    setRefresh(refreshToken);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setUser(null);
    setAccess(null);
    setRefresh(null);
  };

  return (
    <AuthContext.Provider value={{ user, access,refresh, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);