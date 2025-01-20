import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import "./UserEdit.css";
import { jwtDecode } from 'jwt-decode';

const UserProfile = () => {
  const [user, setUser] = useState(null);

  const [profileImage, setProfileImage] = useState(null);
  const { username } = useParams();
  const navigate = useNavigate();

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

        const response = await fetch(`http://127.0.0.1:3001/menu/utilizadores/${username}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": `Bearer ${token}`,
          },
          credentials: "include",
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);

        } else {
          console.error(`Erro ao carregar os dados do utilizador: ${response.error}`);
        }
      } catch (error) {
        console.error("Erro ao carregar os dados do utilizador:", error);
      }
    };

    fetchUserData();
  }, [username]);


  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Tem certeza de que deseja eliminar esta conta? Esta ação não pode ser revertida."
    );
    if (!confirmDelete) return;

    try {
      const cookieValue = decodeURIComponent(
        document.cookie.replace(
          /(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/,
          "$1"
        )
      );

      let token = "";
      const parsedCookie = JSON.parse(cookieValue.replace(/^j:/, ""));
      token = parsedCookie.token;


      let decodedToken;
      try {
        decodedToken = jwtDecode(token);
      } catch (error) {
        console.error('Erro ao decodificar o token:', error);
        return;
      }

      const response = await fetch(`http://127.0.0.1:3001/menu/utilizadores/${username}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (response.ok && decodedToken.username === username) {
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        alert("A sua Conta foi eliminada com sucesso. Faça login/registo novamente.");
        navigate("/login");
      } else if (response.ok) {
        alert("Conta eliminada com sucesso!");
        navigate("/admin/users");
      } else {
        const errorResponse = await response.json();
        alert("Erro ao eliminar conta: " + errorResponse.error);
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao tentar eliminar conta: " + error.message);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadImage = async () => {
    if (!profileImage) return;

    try {
      const cookieValue = decodeURIComponent(document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, "$1"));

      let token = '';
      const parsedCookie = JSON.parse(cookieValue.replace(/^j:/, ''));
      token = parsedCookie.token;


      const response = await fetch(`http://127.0.0.1:3001/menu/utilizador/${user.username}/profile-picture`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ fotoPerfil: profileImage }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        alert("Successfully updated your profile picture!");
        window.location.reload();
      } else {
        console.error(`Erro ao atualizar a foto de perfil: ${response.status}`);
        alert("Erro ao alterar a foto de perfil.");
      }
    } catch (error) {
      console.error("Erro ao atualizar a foto de perfil:", error);
      alert("Erro ao alterar a foto de perfil.");
    }
  };

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div className="userProfile">
      <h2>{user.username}</h2>
      <div className="userImage">
        <img src={user.fotoPerfil} alt={`${user.username}'s profile`} />
      </div>
      <input type="file" accept="image/*" className="imageButtone" onChange={handleImageChange} />
      <button className="submit-e" onClick={handleUploadImage}>Atualizar foto de perfil</button>
      <div className="userField">
        <strong>Nome:</strong> <span>{user.nome}</span>
      </div>
      <div className="userField">
        <strong>Morada:</strong> <span>{user.morada}</span>
      </div>
      <div className="userField">
        <strong>Telemóvel:</strong> <span>{user.telemovel}</span>
      </div>
      <div className="userField">
        <strong>Data de nascimento:</strong> <span>{new Date(user.dataNascimento).toLocaleDateString()}</span>
      </div>
      <div className="userField">
        <strong>NIF:</strong> <span>{user.nif}</span>
      </div>
      <div className="userField">
        <strong>Email:</strong> <span>{user.email}</span>
      </div>
      <div className="userField">
        <strong>Tipo de  conta:</strong> <span>{user.role.nome}</span>
      </div>
      <Link to={{ pathname: `/admin/users/edit/${username}`, state: { userData: user } }} className="edit-profile-button">
        Editar perfil
      </Link>
      <button className="delete-perfil-button" onClick={handleDeleteAccount}>
        Eliminar Conta
      </button>
    </div>
  );
};

export default UserProfile;
