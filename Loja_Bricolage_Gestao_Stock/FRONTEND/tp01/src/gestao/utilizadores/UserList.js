import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './UserList.css';

const SidebarSection = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="sidebar-section">
      <div className="sidebar-section-header" onClick={() => setIsOpen(!isOpen)}>
        <h3>{title}</h3>
        <span>{isOpen ? '▲' : '▼'}</span>
      </div>
      {isOpen && <div className="sidebar-section-content">{children}</div>}
    </div>
  );
};

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filtroUsername, setFiltroUsername] = useState('');
  const [filtroNome, setNome] = useState('');
  const [orderBy, setOrderBy] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const cookieValue = decodeURIComponent(document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, "$1"));

        let token = '';
        try {
          const parsedCookie = JSON.parse(cookieValue.replace(/^j:/, ''));
          token = parsedCookie.token;
        } catch (error) {
          if (!token) {
            alert("Sessão expirada. Por favor, faça login novamente.");
            window.location.href = "/login";
          }
          console.error('Erro ao extrair token do cookie:', error);
        }

        const response = await fetch("http://127.0.0.1:3001/menu/utilizadores/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": `Bearer ${token}`,
          },
          credentials: "include",
        });

        if (response.ok) {
          const userData = await response.json();
          setUsers(userData);
        } else {
          console.error(`Erro ao carregar os dados do utilizador: ${response.status}`);
        }
      } catch (error) {
        console.error("Erro ao carregar os dados do utilizador:", error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...users];

      if (filtroUsername) {
        filtered = filtered.filter(user =>
          user.username.toLowerCase().includes(filtroUsername.toLowerCase())
        );
      }

      if (filtroNome) {
        filtered = filtered.filter(user =>
          user.nome.toLowerCase().includes(filtroNome.toLowerCase())
        );
      }

      if (filtroTipo !== 'todos') {
        filtered = filtered.filter(user => user.role.nome.toLowerCase() === filtroTipo.toLowerCase());
      }

      switch (orderBy) {
        case 'nome-asc':
          filtered.sort((a, b) => a.nome.localeCompare(b.nome));
          break;
        case 'nome-desc':
          filtered.sort((a, b) => b.nome.localeCompare(a.nome));
          break;
        case 'username-asc':
          filtered.sort((a, b) => a.username.localeCompare(b.username));
          break;
        case 'username-desc':
          filtered.sort((a, b) => b.username.localeCompare(a.username));
          break;
        default:
          break;
      }

      setFilteredUsers(filtered);
    };

    if (users.length > 0) {
      applyFilters();
    }
  }, [users, filtroUsername, filtroNome, orderBy, filtroTipo]);

  return (
    <div className="background">
      <div className="sidebar-adminUserList">
        <SidebarSection title="Pesquisa Avançada">
          <div className="search-adminUsers">
            <input
              type="text"
              placeholder="Username do utilizador"
              value={filtroUsername}
              onChange={(e) => setFiltroUsername(e.target.value)}
              className="sidebar-search-input-adminUserList"
            />
          </div>
          <div className="search-adminUsers">
            <input
              type="text"
              placeholder="Nome do utilizador"
              value={filtroNome}
              onChange={(e) => setNome(e.target.value)}
              className="sidebar-search-input-adminUserList"
            />
          </div>
        </SidebarSection>
        <SidebarSection title="Ordenar por">
          <div className="sidebar-dropdown-adminUserList">
            <select
              value={orderBy}
              onChange={(e) => setOrderBy(e.target.value)}
            >
              <option value="">Selecionar Ordem</option>
              <option value="nome-asc">Nome ascendente</option>
              <option value="nome-desc">Nome decrescente</option>
              <option value="username-asc">Username ascendente</option>
              <option value="username-desc">Username decrescente</option>
            </select>
          </div>
        </SidebarSection>
        <SidebarSection title="Tipo de conta">
          <div className="search-adminUsers">
            <label>
              <input
                type="radio"
                value="todos"
                checked={filtroTipo === 'todos'}
                onChange={(e) => setFiltroTipo(e.target.value)}
              />
              Todos
            </label>
          </div>
          <div className="search-adminUsers">
            <label>
              <input
                type="radio"
                value="utilizador"
                checked={filtroTipo === 'utilizador'}
                onChange={(e) => setFiltroTipo(e.target.value)}
              />
              Utilizador
            </label>
          </div>
          <div className="search-adminUsers">
            <label>
              <input
                type="radio"
                value="administrador"
                checked={filtroTipo === 'administrador'}
                onChange={(e) => setFiltroTipo(e.target.value)}
              />
              Administrador
            </label>
          </div>
        </SidebarSection>
      </div>
      <div className="user-list">
        <h2>Gestão de contas de utilizadores</h2>
        <ul>
          {filteredUsers.map(user => (
            <li key={user.username}>
              <Link to={`/admin/users/${user.username}`} className="user-link">
                <div className="user-info">
                  {user.fotoPerfil && <img src={user.fotoPerfil} alt={`Foto de perfil de ${user.username}`} className="user-avatar" />}
                  <div className="user-details">
                    <strong>Utilizador:</strong> {user.username} <br />
                    <strong>Nome completo:</strong> {user.nome} <br />
                    <strong>Tipo de conta:</strong> {user.role.nome} <br />
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UserList;
