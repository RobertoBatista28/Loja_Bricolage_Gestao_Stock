import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './vendaDetail.css';

const VendaDetails = () => {
    const { nrVenda } = useParams();
    const [vendaDetails, setVendaDetails] = useState(null);

    useEffect(() => {
        const fetchVendaDetails = async () => {
            try {
                // Decodificar o cookie para obter o token
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

                // Fetch venda details
                const vendaResponse = await fetch(`http://127.0.0.1:3001/menu/vendas/${nrVenda}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "x-access-token": `Bearer ${token}`,
                    },
                    credentials: 'include',
                });
                const vendaData = await vendaResponse.json();
                setVendaDetails(vendaData);

            } catch (err) {
                console.error('Erro ao buscar detalhes da venda:', err);
            }
        };

        fetchVendaDetails();
    }, [nrVenda]);

    if (!vendaDetails) {
        return <div>Carregando...</div>;
    }

    return (
        <div className="venda-detalhe-card">
            <h1>Venda Nº {vendaDetails.nrVenda}</h1>
            <div className="venda-detalhe-conteudo">
                <div className="venda-informacao">
                    <p><strong>Produtos:</strong></p>
                    <ul>
                        {vendaDetails.produtos?.map((produto) => (
                            <li key={produto.ref}>
                                <div className="produto-informacao">
                                    {produto.imagem && (
                                        <div className="produto-imagem-container">
                                            <img src={produto.imagem} alt={produto.nome} className="produto-imagem" />
                                        </div>
                                    )}
                                    <div className="produto-detalhes">
                                        <p><strong>Nome:</strong> {produto.nome}</p>
                                        <p><strong>Quantidade:</strong> {produto.quantidade}</p>
                                        <p><strong>Preço:</strong> {produto.preco?.toFixed(2)} € / unidade</p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className="venda-data-total">
                        <p><strong>Data:</strong> {new Date(vendaDetails.data).toLocaleDateString()}</p>
                        <p><strong>Total:</strong> {vendaDetails.total?.toFixed(2)} €</p>
                    </div>
                </div>
            </div>
        </div>
    );
    

};

export default VendaDetails;
