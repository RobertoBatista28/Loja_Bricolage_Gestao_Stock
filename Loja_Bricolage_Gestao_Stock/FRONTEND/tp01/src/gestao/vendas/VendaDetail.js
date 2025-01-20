import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './VendaDetail.css';

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

    const handleDeleteVenda = async () => {
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

            const response = await fetch(`http://127.0.0.1:3001/menu/vendas/${nrVenda}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "x-access-token": `Bearer ${token}`,
                },
                credentials: 'include',
            });

            if (response.ok) {
                alert('Venda eliminada com sucesso.');
                window.location.href = '/admin/vendas';
            }

        } catch (error) {
            console.error('Erro ao eliminar a venda:', error);
        }
    }

    return (
        <div className="adminVenda-detalhe-card">
            <h1>Venda Nº {vendaDetails.nrVenda}</h1>
            <div className="adminVenda-detalhe-conteudo">
                <div className="adminVenda-informacao">
                    <ul>
                        {vendaDetails.produtos?.map((produto) => (
                            <li key={produto.ref}>
                                <div className="adminProduto-informacao">
                                    {produto.imagem && (
                                        <div className="adminProduto-imagem-container">
                                            <img src={produto.imagem} alt={produto.nome} className="adminProduto-imagem" />
                                        </div>
                                    )}
                                    <div className="adminProduto-detalhes">
                                        <p><strong>Nome:</strong> {produto.nome}</p>
                                        <p><strong>Quantidade:</strong> {produto.quantidade}</p>
                                        <p><strong>Preço:</strong> {produto.preco?.toFixed(2)} € / unidade</p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className="adminVenda-data-total">
                        <p><strong>Data:</strong> {new Date(vendaDetails.data).toLocaleDateString()}</p>
                        <p><strong>Total:</strong> {vendaDetails.total?.toFixed(2)} €</p>
                    </div>
                    <button className="delete-adminVenda-button" onClick={handleDeleteVenda}>
        Eliminar Venda
      </button>
                </div>
            </div>
        </div>
    );
    

};

export default VendaDetails;
