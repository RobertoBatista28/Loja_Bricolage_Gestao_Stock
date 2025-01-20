import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import "./registarForm.css";

const Register = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

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

  const onSubmit = async (data) => {
    if (data.imagem && data.imagem.length > 0) {
      const file = data.imagem[0];
      const base64Image = await convertToBase64(file);
      data.fotoPerfil = base64Image;
    }
    registerUser(data);
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const registerUser = (data) => {
    fetch("http://127.0.0.1:3001/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((r) => r.json())
      .then((response) => {
        if (response.success) {
          alert("Utilizador registado. Verifique seu email para concluir o registro.");
          navigate("/login");
        } else {
          alert("Erro ao registar novo utilizador. " + response.error);
        }
      })
      .catch((error) => {
        alert("Erro: " + error.message);
      });
  };

  return (
    <div className="loginForm">
      <h2>Registro</h2>
      <form className="form-login" onSubmit={handleSubmit(onSubmit)}>
        <div className="field-registo">
          <label>Username:</label>
          <input className="username-reg" {...register("username", { required: true })} />
          {errors.username && <span className="error-message">Este campo é obrigatório.</span>}
        </div>
        <div className="field-registo">
          <label>Password:</label>
          <input className="password-reg" type="password" {...register("password", { required: true })} />
          {errors.password && <span className="error-message">Este campo é obrigatório.</span>}
        </div>
        <div className="field-registo">
          <label>Nome:</label>
          <input className="nome-reg" {...register("nome", { required: true })} />
          {errors.nome && <span className="error-message">Este campo é obrigatório.</span>}
        </div>
        <div className="field-registo">
          <label>Morada:</label>
          <input className="morada-reg" {...register("morada", { required: true })} />
          {errors.morada && <span className="error-message">Este campo é obrigatório.</span>}
        </div>
        <div className="field-registo">
          <label>Número Telemóvel:</label>
          <input
            className="telemovel-reg"
            {...register("telemovel", {
              required: true,
              pattern: {
                value: /^[0-9]+$/,
                message: "Apenas números são permitidos.",
              },
            })}
          />
          {errors.telemovel && (
            <span className="error-message">
              {errors.telemovel.type === "required" && "Este campo é obrigatório."}
              {errors.telemovel.type === "pattern" && errors.telemovel.message}
            </span>
          )}
        </div>
        <div className="field-registo">
          <label>Data de Nascimento:</label>
          <input
            className="dataNascimento-reg"
            type="date"
            max={maxDate}
            {...register("dataNascimento", { required: true })}
          />
          {errors.dataNascimento && <span className="error-message">Este campo é obrigatório.</span>}
        </div>
        <div className="field-registo">
          <label>NIF:</label>
          <input className="nif-reg" {...register("nif", {
            required: true, pattern: {
              value: /^[0-9]+$/,
              message: "Apenas números são permitidos.",
            },
            minLength: {
              value: 9,
              message: "O NIF deve ter no mínimo 9 caracteres.",
            },
          })} />
          {errors.nif && (
            <span className="error-message">
              {errors.nif.type === "required" && "Este campo é obrigatório."}
              {errors.nif.type === "minLength" && errors.nif.message}
              {errors.nif.type === "pattern" && errors.nif.message}
            </span>
          )}

        </div>
        <div className="field-registo">
          <label>Email:</label>
          <input
            className="email-reg"
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
        <div className="field-registo">
          <label>Imagem:</label>
          <input className="imagem-reg" type="file" {...register("imagem", { required: false })} />
        </div>
        <input className="submit" type="submit" value="Registrar" />
      </form>
      <div className="login-link">
        <Link to="/login">🡸 Já tem uma conta? Faça o login aqui.</Link>
      </div>
    </div>
  );
};

export default Register;