import React from 'react';
import { Link } from 'react-router-dom';
import './404.css';
import NotFoundImage from "./Image1.png";

const NotFound = () => {
    return (
        <div className="not-found">
            <h1>Erro 404</h1>
            <p>Acho que está um pouco perdido por aqui...</p>
            <p>Não se preocupe, o Tiago ajuda-o a voltar à página principal</p>
            <div className="not-found-content">
                <img src={NotFoundImage} alt="Página não encontrada" className="not-found-image" />
                <Link to="/produtos" className="home-button">Página inicial</Link>
            </div>
        </div>
    );
};

export default NotFound;
