import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './Produto.css';

const ProductDetails = () => {
    const { referencia } = useParams();
    const [productDetails, setProductDetails] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [token, setToken] = useState('');
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                // Fetch product details
                const productResponse = await fetch(`http://127.0.0.1:3001/menu/produtos/${referencia}`, {
                    credentials: 'include'
                });
                const productData = await productResponse.json();
                setProductDetails(productData);

                // Decodificar o cookie para obter o token
                const cookieValue = decodeURIComponent(document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, "$1"));
                let token = '';

                const parsedCookie = JSON.parse(cookieValue.replace(/^j:/, ''));
                token = parsedCookie.token;
                setToken(token); // Set token state if present


                if (token) {
                    // Fetch user favorites if token is present
                    const favoritesResponse = await fetch(`http://127.0.0.1:3001/menu/utilizador/favoritos`, {
                        method: 'GET',
                        headers: {
                            'x-access-token': `Bearer ${token}`
                        },
                        credentials: 'include'
                    });
                    const favoritesData = await favoritesResponse.json();

                    // Verificar se a referência do produto está nos favoritos
                    const isFavoriteProduct = Array.isArray(favoritesData) && favoritesData.includes(referencia);
                    setIsFavorite(isFavoriteProduct);


                }
            } catch (err) {
                console.error('Erro ao buscar detalhes do produto:', err);
            }
        };

        fetchProductDetails();
    }, [referencia]);

    const handleFavoriteToggle = async () => {
        if (!token) return; // Do nothing if token is not present

        const newIsFavorite = !isFavorite;
        setIsFavorite(newIsFavorite);

        try {
            // Atualizar favoritos
            await fetch(`http://127.0.0.1:3001/menu/utilizador/favoritos`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': `Bearer ${token}`
                },
                body: JSON.stringify({ referencia, add: newIsFavorite }),
                credentials: 'include'
            });

        } catch (err) {
            console.error('Erro ao atualizar favoritos:', err);
        }
    };

    const addToCart = async () => {
        try {
            // Verificar se existe um carrinho existente para o utilizador
            const cartResponse = await fetch(`http://127.0.0.1:3001/menu/venda/me`, {
                method: 'GET',
                headers: {
                    'x-access-token': `Bearer ${token}`
                },
                credentials: 'include'
            });

            if (cartResponse.ok) {
                const cartData = await cartResponse.json();

                // Verificar se há um carrinho com estado "no carrinho"
                const existingCart = cartData.find(venda => venda.estado === 'Carrinho');

                if (existingCart) {
                    const nrVenda = existingCart.nrVenda;
                    // Já existe um carrinho com estado "no carrinho", atualiza a venda existente
                    const response = await fetch(`http://127.0.0.1:3001/menu/venda/me`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-access-token': `Bearer ${token}`
                        },
                        body: JSON.stringify({ produtos: [{ refProduto: referencia, quantity }], nrVenda }), // Exemplo: atualizar a quantidade do produto no carrinho
                        credentials: 'include'
                    });

                    if (response.ok) {
                        alert('Produto adicionado ao carrinho');
                    } else {
                        const errorData = await response.json();
                        console.error('Erro ao adicionar produto no carrinho:', errorData);
                        alert(`Erro ao adicionar produto no carrinho: ${errorData.message}`);
                    }
                } else {
                    // Não existe um carrinho com estado "no carrinho", cria um novo carrinho
                    const response = await fetch(`http://127.0.0.1:3001/menu/venda/me`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-access-token': `Bearer ${token}`
                        },
                        body: JSON.stringify({ referencia, quantity }), // Exemplo: adicionar a quantidade especificada do produto ao carrinho
                        credentials: 'include'
                    });

                    if (response.ok) {
                        alert('Produto adicionado ao carrinho');
                    } else {
                        const errorData = await response.json();
                        console.error('Erro ao adicionar produto ao carrinho:', errorData);
                        alert(`Erro ao adicionar produto ao carrinho: ${errorData.message}`);
                    }
                }

            } else {
                const errorData = await cartResponse.json();
                console.error('Erro ao verificar o carrinho do utilizador:', errorData);
                alert(`Erro ao verificar o carrinho do utilizador: ${errorData.message}`);
            }
        } catch (err) {
            console.error('Erro ao adicionar produto ao carrinho:', err);
            alert(`Erro ao adicionar produto ao carrinho: ${err.message}`);
        }
    };



    if (!productDetails) {
        return <div>Carregando...</div>;
    }

    const { stock } = productDetails;

    return (
        <div className="product-card">
            <h1>{productDetails.nome.toUpperCase()}</h1>
            <div className="product-details">
                {productDetails.imagem && (
                    <div className="image-container">
                        <img src={productDetails.imagem} alt={productDetails.nome} className="product-image" />
                    </div>
                )}
                <div className="product-info">
                    <h2>{productDetails.preco.toFixed(2)} €</h2>
                    <p className="note"> Vendido por: <strong>JR Bricolage</strong></p>
                    <p><strong>Referência: {productDetails.referencia}</strong></p>
                    <p><strong>Nome:</strong> {productDetails.nome}</p>
                    <p><strong>Descrição:</strong> {productDetails.descricao}</p>
                    <p><strong>Categoria:</strong> {productDetails.categoria}</p>
                    {stock ? (
                        stock.quantidade > 0 ? (
                            stock.quantidade < 50 ? (
                                <p className="low-stock-info">🟡 Quase a esgotar</p>
                            ) : (
                                <p className="stock-info">🟢 Em stock</p>
                            )
                        ) : (
                            <p className="no-stock-info">🔴 Não tem stock</p>
                        )
                    ) : (
                        <p className="no-stock-info">Sem informação de stock disponível</p>
                    )}
                    <div className="quantity-container">
                        <p><strong>Quantidade:</strong></p>
                        <div className="qtd-container">
                            <input className="qtd-prod" type="number" name="qtd" required step="1" min={1} value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))} />
                        </div>
                        {token && (
                            <button className={`favorite-toggle ${isFavorite ? 'favorite' : ''}`} onClick={handleFavoriteToggle}>
                                {isFavorite ? '★' : '☆'}
                            </button>
                        )}
                    </div>
                    <div className="container">
                        <button className="add-to-cart" onClick={addToCart}>ADICIONAR AO CARRINHO</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;