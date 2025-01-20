import React, { useState, useEffect } from "react";
import { useLocation, NavLink } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import "./Header.css";

const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

const Header = () => {
    const location = useLocation();
    const [loggedIn, setLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState('');
    const [decodedToken, setDecodedToken] = useState('');

    useEffect(() => {
        const token = getCookie('token');
        if (token) {
            setLoggedIn(true);
            fetchUserRole(token);
        }
    }, []);

    const fetchUserRole = async () => {
        try {
            const cookieValue = decodeURIComponent(document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, "$1"));

            let token = '';
            try {
                const parsedCookie = JSON.parse(cookieValue.replace(/^j:/, ''));
                token = parsedCookie.token;
                setDecodedToken(jwtDecode(token));
            } catch (error) {
                if (!token) {
                  alert("Sessão expirada. Por favor, faça login novamente.");
                  window.location.href = "/login";
                }
                console.error('Erro ao extrair token do cookie:', error);
              }

            const response = await fetch("http://127.0.0.1:3001/menu/utilizador/me", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "x-access-token": `Bearer ${token}`,
                },
                credentials: "include",
            });

            if (response.ok) {
                const userData = await response.json();
                setUserRole(userData.role.nome);
            } else {
                console.error(`Erro ao carregar os dados do utilizador: ${response.status}`);
            }
        } catch (error) {
            console.error("Erro ao carregar os dados do utilizador:", error);
        }
    };

    const handleLogin = () => {
        setLoggedIn(true);
    };

    const handleLogout = () => {
        setLoggedIn(false);
        setUserRole('');
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        console.log('Logout efetuado. Redirecionando para login...');
    };

    if (location.pathname === '/login' || location.pathname === '/registar' || location.pathname === '/recover' || location.pathname === '/reset') {
        return null;
    }

    return (
        <header className="header">
            <h1>JR Bricolage</h1>
            <nav>
                <div>
                    {userRole === 'utilizador' && (
                        <ul className="prod">
                            <li><NavLink to="/produtos">Produtos</NavLink></li>
                        </ul>
                    )}
                </div>
                <div>
                    <ul className="perfil">
                        {loggedIn ? (
                            <>
                                {userRole === 'administrador' && (
                                    <li className="admin-dropdown">
                                        <span className="admin-dropbtn">Gestão</span>
                                        <div className="admin-dropdown-content">
                                            <NavLink to="/admin/users">Utilizadores</NavLink>
                                            <NavLink to="/produtos">Produtos</NavLink>
                                            <NavLink to="/admin/vendas">Vendas</NavLink>
                                        </div>
                                    </li>
                                    
                                )}
                                {userRole === 'utilizador' && (
                                    <>
                                    <li><NavLink to="/carrinho">Carrinho</NavLink></li>
                                        <li><NavLink to={`/${decodedToken.username}/vendas`}>Vendas</NavLink></li>
                                    </>
                                )}
                                <li><NavLink to="/me">Minha conta</NavLink></li>
                                <li><NavLink to="/login" onClick={handleLogout}>Logout</NavLink></li>
                            </>
                        ) : (
                            <li><NavLink to="/login" onClick={handleLogin}>Login</NavLink></li>
                        )}
                    </ul>
                </div>
            </nav>
        </header>
    );
};

export default Header;
