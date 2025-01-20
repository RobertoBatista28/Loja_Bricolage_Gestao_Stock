import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./utilizador.css";

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const cookieValue = decodeURIComponent(
                    document.cookie.replace(
                        /(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/,
                        "$1"
                    )
                );

                let token = "";
                try {
                    const parsedCookie = JSON.parse(
                        cookieValue.replace(/^j:/, "")
                    );
                    token = parsedCookie.token;
                } catch (error) {
                    if (!token) {
                        alert("Sessão expirada. Por favor, faça login novamente.");
                        window.location.href = "/login";
                    }
                    console.error('Erro ao extrair token do cookie:', error);
                }

                const response = await fetch(
                    "http://127.0.0.1:3001/menu/utilizador/me",
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "x-access-token": `Bearer ${token}`,
                        },
                        credentials: "include",
                    }
                );

                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                } else {
                    console.error(
                        `Erro ao carregar os dados do utilizador: ${response.status}`
                    );
                }
            } catch (error) {
                console.error(
                    "Erro ao carregar os dados do utilizador:",
                    error
                );
            }
        };
        fetchUserData();
    }, []);

    const handleDeleteAccount = async () => {
        const confirmDelete = window.confirm(
            "Tem certeza de que deseja eliminar sua conta? Esta ação não pode ser desfeita."
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


            if (!token) {
                alert("Token não encontrado. Por favor, faça login novamente.");
                return;
            }

            const response = await fetch(
                `http://127.0.0.1:3001/menu/utilizador/me`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        "x-access-token": `Bearer ${token}`,
                    },
                    credentials: "include",
                }
            );

            if (response.ok) {
                document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                alert("Conta eliminada com sucesso!");
                navigate("/login");
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
            const cookieValue = decodeURIComponent(
                document.cookie.replace(
                    /(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/,
                    "$1"
                )
            );

            let token = "";

            const parsedCookie = JSON.parse(cookieValue.replace(/^j:/, ""));
            token = parsedCookie.token;


            const response = await fetch(
                "http://127.0.0.1:3001/menu/utilizador/me",
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "x-access-token": `Bearer ${token}`,
                    },
                    credentials: "include",
                    body: JSON.stringify({ fotoPerfil: profileImage }),
                }
            );

            if (response.ok) {
                const updatedUser = await response.json();
                setUser(updatedUser);
                alert("Foto de perfil atualizada com sucesso!");
                window.location.reload();
            } else {
                console.error(
                    `Erro ao atualizar a foto de perfil: ${response.status}`
                );
                alert("Erro ao atualizar a foto de perfil.");
            }
        } catch (error) {
            console.error("Erro ao atualizar a foto de perfil:", error);
            alert(
                "Erro ao atualizar a foto de perfil. Verifique sua conexão ou tente novamente mais tarde."
            );
        }
    };

    if (!user) {
        return <p>Carregando...</p>;
    }

    return (
        <div className="userProfile">
            <h2>Perfil do Utilizador</h2>
            <div className="userImage">
                <img src={user.fotoPerfil} alt="Foto do Utilizador" />
            </div>
            <strong>Imagem de perfil:</strong>
            <br></br>
            <input
                className="imageButton"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
            />
            <button className="uploadButton" onClick={handleUploadImage}>
                Guardar alterações
            </button>
            <div className="userField">
                <strong>Utilizador:</strong> <span>{user.username}</span>
            </div>
            <div className="userField">
                <strong>Nome completo:</strong> <span>{user.nome}</span>
            </div>
            <div className="userField">
                <strong>Morada:</strong> <span>{user.morada}</span>
            </div>
            <div className="userField">
                <strong>Telemóvel:</strong> <span>{user.telemovel}</span>
            </div>
            <div className="userField">
                <strong>Data de Nascimento:</strong>{" "}
                <span>
                    {new Date(user.dataNascimento).toLocaleDateString()}
                </span>
            </div>
            <div className="userField">
                <strong>NIF:</strong> <span>{user.nif}</span>
            </div>
            <div className="userField">
                <strong>Email:</strong> <span>{user.email}</span>
            </div>
            <div className="userField">
                <strong>Tipo de conta:</strong> <span>{user.role.nome}</span>
            </div>
            <Link
                to={{ pathname: "/me/editar", state: { userData: user } }}
                className="edit-profile-button"
            >
                Editar perfil
            </Link>
            <Link
                to={{
                    pathname: "/me/editar/password",
                    state: { userData: user },
                }}
                className="password-button"
            >
                Alterar Password
            </Link>
            <button className="delete-perfil-button" onClick={handleDeleteAccount}>
                Eliminar Conta
            </button>
        </div>
    );
};

export default UserProfile;
