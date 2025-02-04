import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import "./recoverForm.css";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
  const [resetSuccess, setResetSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit = (data) => {
    fetch("http://127.0.0.1:3001/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erro ao solicitar recuperação de Password");
        }
        return response.json();
      })
      .then(() => {
        setResetSuccess(true);
      })
      .catch((error) => {
        console.error("Erro:", error);
        setErrorMessage("Erro ao solicitar recuperação de Password");
      });
  };

  return (
    <div className="forgotPasswordForm">
      <h2>Redefinir palavra-passe</h2>
      {resetSuccess ? (
        navigate("/reset")
      ) : (
        <form className="form-forgot-password" onSubmit={handleSubmit(onSubmit)}>
          <div className="field"> 
            <label>Email:</label>
            <input className="email" {...register("email")} />
          </div>
          <input className="submit" type="submit" value="Enviar" />
          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </form>
      )}
      <div className="return-link">
        <Link to="/login">🡸 Voltar para a página de login</Link>
      </div>
    </div>
  );
};

export default ForgotPassword;