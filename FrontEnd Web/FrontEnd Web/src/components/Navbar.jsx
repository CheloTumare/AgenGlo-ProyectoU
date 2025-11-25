import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../Agendamiento/contexts/AuthContext';
import './Navbar.css';
import Logotipo from '/Logotipo.png';
import {
  User,
  Calendar,
  CalendarDays,
  Settings,
  Clock,
  Users,
  Home,
  LogOut,
  Bell,
  LogIn,
  UserPlus,
  Menu, // Icono para el menú móvil
  X // Icono para cerrar el menú móvil
} from 'lucide-react';

const Navbar = () => {  
  const [loading, setLoading] = useState(true);
  // Estado para controlar la visibilidad del menú móvil
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Rutas que no deben mostrar el navbar
  const hiddenNavbarRoutes = ['/', '/signup', '/login', '/otp/verify', '/forget_password'];
  const shouldHideNavbar = hiddenNavbarRoutes.includes(location.pathname) ||
                         location.pathname.includes('/api/v1/auth/password-reset-confirm');

  if (shouldHideNavbar) {
    return null;
  }

  // Define las rutas
  const staffRoutes = [
    {
      name: 'Servicios',
      href: '/servicios',
      icon: Settings,
      description: 'Gestionar servicios'
    },
    {
      name: 'Disponibilidad',
      href: '/disponibilidad',
      icon: Clock,
      description: 'Configurar horarios'
    },
    {
      name: 'Gestión Citas',
      href: '/gestion-citas',
      icon: Users,
      description: 'Administrar citas de clientes'
    }
  ];
  const clientRoutes = [
    {
      name: 'Mis Citas',
      href: '/mis-citas',
      icon: CalendarDays,
      description: 'Ver mis citas programadas'
    }
  ];
  const commonRoutes = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      description: 'Panel principal'
    },
    {
      name: 'Agendamiento',
      href: '/agendamiento-dashboard',
      icon: Calendar,
      description: 'Centro de agendamiento'
    }
  ];
  const preLogin = [
    {
      name: 'Iniciar Sesión',
      href: '/login',
      icon: LogIn,
      description: 'Iniciar Sesión'
    },
    {
      name: 'Registrarse',
      href: '/signup',
      icon: UserPlus,
      description: 'Registra tus datos'
    }
  ];

  // Construye la lista de navegación
  const navigationItems = [
    ...commonRoutes,
    ...(!user ? preLogin : (user?.is_staff ? staffRoutes : clientRoutes))
  ];

  const isActiveRoute = (href) => {
    return location.pathname === href;
  };

return (
<nav className="navbar-container">
      <div className="navbar-content">
        {/* Logo y nombre */}
        <div className="navbar-logo-area">
          <Link to="/" className="navbar-logo-link">
            {/* ⬅️ TU LOGO DE IMAGEN */}
            <img src={Logotipo} alt="Logotipo de AgenGlo" className="logo-image" />
            <span className="logo-text">AgenGlo</span>
          </Link>
        </div>

        {/* Botón de Menú Móvil */}
        <div className="menu-toggle-button">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
            {isMenuOpen ? <X className="menu-icon" /> : <Menu className="menu-icon" />}
          </button>
        </div>

        {/* Links de navegación - Desktop y Mobile */}
        <div className={`navbar-links-desktop ${isMenuOpen ? 'navbar-links-mobile-open' : 'navbar-links-mobile-closed'}`}>
          <div className="nav-links-list">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-link ${isActiveRoute(item.href) ? 'nav-link-active' : ''}`}
                  title={item.description}
                  onClick={() => setIsMenuOpen(false)} 
                >
                  <Icon className="nav-link-icon" />
                  <span>{item.name}</span>
                  {isActiveRoute(item.href) && (<div className="nav-link-underline"></div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Usuario y acciones - Solo visible en desktop/mobile menu */}
          <div className="navbar-user-actions">
            
            {/* Botón de notificaciones (solo si hay usuario) */}
            {!user ? (
              <p></p>
            ) : (
              <button className="notification-button">
                <Bell className="notification-icon" />
              </button>
            )}

            {/* Perfil de usuario */}
            <div className="user-profile-info">
              {/* Avatar de icono */}
              <div className="user-avatar">
                <User className="user-avatar-icon" />
              </div>
              <div className="user-text-details">
                <p className="user-name">
                  {user?.name || user?.email || 'Usuario Desconectado'}
                </p>
                <p className="user-role">
                  {user?.is_staff ? 'Proveedor' : 'Cliente'}
                </p>
              </div>
            </div>

            {/* Botón de logout (solo si hay usuario) */}
            {!user ? (
              <p></p>
              ) : (
              <button
                onClick={handleLogout}
                className="logout-button"
                title="Cerrar sesión"
              >
                <LogOut className="logout-icon" />
                <span className="logout-text">Salir</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;