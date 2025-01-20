import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import InfiniteScroll from 'react-infinite-scroll-component';
import './userVendaList.css';

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

const UserVendaList = () => {
    const [vendas, setVendas] = useState([]);
    const [decodedToken, setDecodedToken] = useState('');
    const [filtroNrVenda, setFiltroNrVenda] = useState('');
    const [filtroProduto, setFiltroProduto] = useState('');
    const [filtroData, setFiltroData] = useState('');
    const [filtroPeriodo, setFiltroPeriodo] = useState('');
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [filteredVendas, setFilteredVendas] = useState([]);

    const VENDAS_PER_PAGE = 7;

    const isValidDate = (date) => {
        return !isNaN(Date.parse(date));
    };

    const filtrarVendas = () => {
        return vendas.filter((venda) => {
            const produtoMatch = filtroProduto ? venda.produtos.some((produto) => produto.nome.toLowerCase().includes(filtroProduto.toLowerCase())) : true;
            const dataMatch = filtroData ? isValidDate(venda.data) && new Date(venda.data).toISOString().split('T')[0] === filtroData : true;

            const periodoMatch = (() => {
                if (!filtroPeriodo) return true;

                const vendaData = new Date(venda.data);
                const now = new Date();

                switch (filtroPeriodo) {
                    case 'ultimo-mes':
                        return vendaData >= new Date(now.setMonth(now.getMonth() - 1));
                    case 'ultimos-3-meses':
                        return vendaData >= new Date(now.setMonth(now.getMonth() - 3));
                    case 'ultimo-ano':
                        return vendaData >= new Date(now.setFullYear(now.getFullYear() - 1));
                    case 'mais-antigo':
                        return vendaData < new Date(now.setFullYear(now.getFullYear() - 1));
                    default:
                        return true;
                }
            })();

            return venda.nrVenda.toString().includes(filtroNrVenda) && produtoMatch && dataMatch && periodoMatch;
        });
    };

    const applyFilters = () => {
        const filtered = filtrarVendas();
        setFilteredVendas(filtered.slice(0, VENDAS_PER_PAGE));
        setPage(1);
        setHasMore(filtered.length > VENDAS_PER_PAGE);
    };

    useEffect(() => {
        const fetchVendaData = async () => {
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

                const response = await fetch("http://127.0.0.1:3001/menu/venda/finalizar", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "x-access-token": `Bearer ${token}`,
                    },
                    credentials: "include",
                });

                if (response.ok) {
                    const vendaData = await response.json();
                    setVendas(vendaData);
                    applyFilters(); 
                } else {
                    console.error(`Erro ao carregar os dados do utilizador: ${response.status}`);
                }
            } catch (error) {
                console.error("Erro ao carregar os dados do utilizador:", error);
            }
        };

        fetchVendaData();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filtroNrVenda, filtroProduto, filtroData, filtroPeriodo, vendas]); 

    const loadMoreVendas = () => {
        const start = page * VENDAS_PER_PAGE;
        const end = start + VENDAS_PER_PAGE;
        const newVendas = filtrarVendas().slice(start, end);
        setFilteredVendas((prevVendas) => [...prevVendas, ...newVendas]);
        setPage(page + 1);

        if (newVendas.length < VENDAS_PER_PAGE) {
            setHasMore(false);
        }
    };

    return (
        <div className="background">
            <div className="sidebar-userVendaList">
                <SidebarSection title="Filtros">
                    <div className="search-userVendas">
                        <input
                            type="text"
                            placeholder="Pesquisar por número da venda"
                            value={filtroNrVenda}
                            onChange={(e) => setFiltroNrVenda(e.target.value)}
                            className="sidebar-search-input-userVendaList"
                        />
                    </div>
                    <div className="search-userVendas">
                        <input
                            type="text"
                            placeholder="Pesquisar por nome do produto"
                            value={filtroProduto}
                            onChange={(e) => setFiltroProduto(e.target.value)}
                            className="sidebar-search-input-userVendaList"
                        />
                    </div>
                    <div className="search-userVendas">
                        <input
                            type="date"
                            placeholder="Pesquisar por data"
                            value={filtroData}
                            onChange={(e) => setFiltroData(e.target.value)}
                            className="sidebar-search-input-userVendaList"
                        />
                    </div>
                    <div className="sidebar-dropdown-userVendaList">
                        <select
                            value={filtroPeriodo}
                            onChange={(e) => setFiltroPeriodo(e.target.value)}
                        >
                            <option value="">Selecionar Período</option>
                            <option value="ultimo-mes">Último Mês</option>
                            <option value="ultimos-3-meses">Últimos 3 Meses</option>
                            <option value="ultimo-ano">Último Ano</option>
                            <option value="mais-antigo">Mais Antigo</option>
                        </select>
                    </div>
                </SidebarSection>
            </div>
            <div className="userVenda-list-container">
                <div className="userVenda-list">
                    <h2>Vendas Concluídas</h2>
                    <InfiniteScroll
                        dataLength={filteredVendas.length}
                        next={loadMoreVendas}
                        hasMore={hasMore}
                        loader={<p style={{ textAlign: 'center' }}>Carregando...</p>}
                        endMessage={<p style={{ textAlign: 'center' }}>Você viu todas as vendas!</p>}
                        scrollThreshold={0.9} // Carregar mais quando 90% do conteúdo estiver visível
                    >
                        <ul>
                            {filteredVendas.map((venda) => {
                                const produtoComMaiorQuantidade = venda.produtos.reduce((prev, curr) => {
                                    return curr.quantidade > prev.quantidade ? curr : prev;
                                }, venda.produtos[0]);

                                return (
                                    <li key={venda.nrVenda}>
                                        <Link
                                            to={`/${decodedToken.username}/vendas/${venda.nrVenda}`}
                                            className="userVenda-link"
                                        >
                                            <div className="userVenda-info">
                                                <div className="userVenda-images">
                                                    <img
                                                        src={produtoComMaiorQuantidade.imagem}
                                                        alt={`Imagem de ${produtoComMaiorQuantidade.nome}`}
                                                        className="userVenda-product-image"
                                                    />
                                                </div>
                                                <div className="userVenda-details">
                                                    <strong>Número da Venda:</strong> {venda.nrVenda} <br />
                                                    <strong>Produtos:</strong>{' '}
                                                    {venda.produtos.map((produto) => produto.nome).join(', ')}{' '}
                                                    <br />
                                                    <strong>Quantidade:</strong>{' '}
                                                    {venda.produtos.map((produto) => produto.quantidade).join(', ')}{' '}
                                                    <br />
                                                    <strong>Data:</strong>{' '}
                                                    {new Date(venda.data).toLocaleDateString()}{' '}
                                                    <br />
                                                    <strong>Total:</strong>{' '}
                                                    {venda.total.toFixed(2)} €{' '}
                                                </div>
                                            </div>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </InfiniteScroll>
                </div>
            </div>
        </div>
    );
};

export default UserVendaList;