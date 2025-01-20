import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import "./UserEdit.css";
import {jwtDecode} from "jwt-decode";

const UserForm = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [usernameIgual, setUsernameIgual] = useState(false);
  const { username } = useParams();

  const today = new Date();
  const sixteenYearsAgo = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
  sixteenYearsAgo.setHours(0, 0, 0, 0); 

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const maxDate = formatDate(sixteenYearsAgo);

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
          setUsernameIgual(false);
          const userData = await response.json();
          setUserData(userData);
          setValue("username", userData.username || "");
          setValue("nome", userData.nome || "");
          setValue("morada", userData.morada || "");
          setValue("telemovel", userData.telemovel || "");
          const formattedDate = userData.dataNascimento ? new Date(userData.dataNascimento).toISOString().substr(0, 10) : "";
          setValue("dataNascimento", formattedDate);
          setValue("nif", userData.nif || "");
          setValue("email", userData.email || "");
          setValue("role", userData.role.nome || ""); 
          setLoading(false);
  
          let decodedToken;
          try {
            decodedToken = jwtDecode(token);
          } catch (error) {
            console.error('Erro ao decodificar o token:', error);
            return;
          }
  
          setUsernameIgual(decodedToken.username === userData.username);
  
        } else {
          console.error(`Erro ao carregar os dados do utilizador: ${response.status}`);
          alert("Erro ao carregar os dados do utilizador.");
        }
      } catch (error) {
        console.error("Erro ao carregar os dados do utilizador:", error);
        alert("Erro ao carregar os dados do utilizador.");
      }
    };
  
    fetchUserData();
  }, [username, setValue]);
  

  const onSubmit = async (data) => { 
    try {
      const cookieValue = decodeURIComponent(document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, "$1"));
      let token = '';
      
        const parsedCookie = JSON.parse(cookieValue.replace(/^j:/, ''));
        token = parsedCookie.token;
      

      const modifiedFields = {};
      if (data.username !== userData.username) {
        modifiedFields.username = data.username;
      }
      if (data.nome !== userData.nome) {
        modifiedFields.nome = data.nome;
      }
      if (data.morada !== userData.morada) {
        modifiedFields.morada = data.morada;
      }
      if (data.telemovel !== userData.telemovel) {
        modifiedFields.telemovel = data.telemovel;
      }
      if (data.dataNascimento !== userData.dataNascimento) {
        modifiedFields.dataNascimento = data.dataNascimento;
      }
      if (data.nif !== userData.nif) {
        modifiedFields.nif = data.nif;
      }
      if (data.email !== userData.email) {
        modifiedFields.email = data.email;
      }

      if (data.role !== userData.role.nome) {
      modifiedFields.role = { nome: data.role };
    }

      const response = await fetch(`http://127.0.0.1:3001/menu/utilizadores/${username}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": `Bearer ${token}`,
        },
        body: JSON.stringify(modifiedFields),
      });

      if (response.ok) {
        if (usernameIgual && data.username !== userData.username) {
          document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          alert("Username foi alterado. Faça login novamente");
          navigate("/login");
        }else if (data.username !== userData.username) {
          alert("Utilizador atualizado com sucesso.");
          navigate(`/admin/users/${data.username}`);
        } else {
          alert("Utilizador atualizado com sucesso.");
          navigate(`/admin/users/${username}`);
        }
      } else {
        const errorData = await response.json();
        alert(`Erro ao atualizar os dados do utilizador: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Erro ao editar utilizador:", error);
      alert("Erro ao atualizar os dados do utilizador.");
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="edit-profile-container">
      <h2>Editar perfil</h2>
      <form className="edit-profile-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="edit-profile-field">
          <label>Username:</label>
          <input className="edit-profile-input" {...register("username", { required: true })} />
          {errors.username && <span className="edit-profile-error">Este campo é obrigatório.</span>}
        </div>
        <div className="edit-profile-field">
          <label>Nome:</label>
          <input className="edit-profile-input" {...register("nome", { required: true })} />
          {errors.nome && <span className="edit-profile-error">Este campo é obrigatório.</span>}
        </div>
        <div className="edit-profile-field">
          <label>Morada:</label>
          <input className="edit-profile-input" {...register("morada", { required: true })} />
          {errors.morada && <span className="edit-profile-error">Este campo é obrigatório.</span>}
        </div>
        <div className="edit-profile-field">
          <label>Telemóvel:</label>
          <input className="edit-profile-input" {...register("telemovel", { required: true })} />
          {errors.telemovel && <span className="edit-profile-error">Este campo é obrigatório.</span>}
        </div>
        <div className="edit-profile-field">
        <label>Data de Nascimento:</label>
        <input
          className="dataNascimento"
          type="date"
          max={maxDate} 
          {...register("dataNascimento", { required: true })}
        />
        {errors.dataNascimento && <span className="error-message">Este campo é obrigatório.</span>}
        </div>
        <div className="edit-profile-field">
          <label>NIF:</label>
          <input className="edit-profile-input" {...register("nif", { required: true })} />
          {errors.nif && <span className="edit-profile-error">Este campo é obrigatório.</span>}
        </div>
        <div className="edit-profile-field">
          <label>Email:</label>
          <input
            className="edit-profile-input"
            type="email"
            {...register("email", {
              required: "Este campo é obrigatório.",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                message: "Por favor, introduza um email válido.",
              },
            })}
          />
          {errors.email && (
            <span className="error-message">
              {errors.email.message}
            </span>
          )}
        </div>
        <div className="edit-profile-field">
          <label>Tipo de conta:</label>
          <select className="edit-profile-input-role" {...register("role", { required: true })}>
            <option value="utilizador">utilizador</option>
            <option value="administrador">administrador</option>
          </select>
          {errors.role && <span className="edit-profile-error">Este campo é obrigatório.</span>}
        </div>
        <input className="edit-profile-submit" type="submit" value="Atualizar dados" />
      </form>
    </div>
  );
  
};

export default UserForm;
