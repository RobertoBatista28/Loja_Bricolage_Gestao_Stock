import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./Stocks.css";

const AddStock = () => {
  const { referencia } = useParams();
  const [reference, setReference] = useState(referencia || "");
  const [movementType, setMovementType] = useState("ENTRADA");
  const [quantity, setQuantity] = useState(0);
  const [currentStock, setCurrentStock] = useState(0);

  const handleReferenceChange = (e) => setReference(e.target.value);
  const handleMovementTypeChange = (e) => setMovementType(e.target.value);
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0) {
      setQuantity(value);
    }
  };

  useEffect(() => {
    const fetchCurrentStock = async () => {
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

      if (!token) {
        console.error('Token não encontrado');
        return;
      }

      const response = await fetch(`http://127.0.0.1:3001/menu/stocks/${reference}`, {
        method: 'GET',
        headers: {
          'x-access-token': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: "include"
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentStock(data.quantidade);
      } else {
        console.error("Erro ao obter o stock atual");
      }
    };

    fetchCurrentStock();
  }, [reference]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const cookieValue = decodeURIComponent(document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, "$1"));
      let token = '';
      
        const parsedCookie = JSON.parse(cookieValue.replace(/^j:/, ''));
        token = parsedCookie.token;
      

      if (!token) {
        console.error('Token não encontrado');
        return;
      }

      // Verificar se o stock já existe
      const checkStockResponse = await fetch(`http://127.0.0.1:3001/menu/stocks/${reference}`, {
        method: 'GET',
        headers: {
          'x-access-token': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: "include"
      });

      if (checkStockResponse.ok) {
        // Se o stock existe, atualize-o
        const existingStock = await checkStockResponse.json();
        const updatedQuantity = movementType === "ENTRADA" ? existingStock.quantidade + quantity : existingStock.quantidade - quantity;

        const updateResponse = await fetch(`http://127.0.0.1:3001/menu/stocks/${reference}`, {
          method: 'PUT',
          headers: {
            'x-access-token': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ quantity: updatedQuantity }),
        });

        if (updateResponse.ok) {
          alert(`Stock adicionado com sucesso.\n\n Contagem atual: ${updatedQuantity}`)
          window.location.reload();
        } else {
          console.error("Erro ao atualizar o stock:", updateResponse.statusText);
          alert(`Está a tentar remover mais itens do que tem na base de dados.\n\n" + "Contagem atual: ${existingStock.quantidade}`)
        }
      } else if (checkStockResponse.status === 404) {
        // Se o stock não existe, crie-o

        const cookieValue = decodeURIComponent(document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, "$1"));
        let token = '';
        try {
          const parsedCookie = JSON.parse(cookieValue.replace(/^j:/, ''));
          token = parsedCookie.token;
        } catch (error) {
          console.error('Erro ao extrair token do cookie:', error);
        }

        if (!token) {
          console.error('Token não encontrado');
          return;
        }
        const createResponse = await fetch('http://127.0.0.1:3001/menu/stock', {
          method: 'POST',
          headers: {
            'x-access-token': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refProduto: reference,
            quantidade: quantity,
            movimento: movementType,
          }),
        });

        if (createResponse.ok) {
          console.log("Stock modificado com sucesso.");
          window.location.reload();
        } else {
          console.error("Erro ao criar o stock.");
        }
      } else {
        const response = await fetch(`http://127.0.0.1:3001/menu/stocks/criar`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': `Bearer ${token}`
          },
          body: JSON.stringify({
            refProduto: reference,
            quantidade: quantity,
            movimento: movementType,
          }), 
          credentials: 'include'
        });
        const data = await response.json();
        console.log('Produto adicionado ao carrinho:', data);
      }
    } catch (error) {
      console.error("Erro ao adicionar stock:", error);
    }
  };

  return (
    <div className="add-stock">
      <h2>Adicionar stock</h2>
      <form onSubmit={handleSubmit} className="form-add-stock">
        <div className="field">
          <label htmlFor="reference">Referência:</label>
          <input
            type="text"
            id="reference"
            value={reference}
            onChange={handleReferenceChange}
            className="input-text"
            readOnly
          />
        </div>
        <div className="field">
          <label htmlFor="movementType">Tipo de movimento:</label>
          <select
            id="movementType"
            value={movementType}
            onChange={handleMovementTypeChange}
            className="input-select"
          >
            <option value="ENTRADA">ENTRADA</option>
            <option value="SAIDA">SAIDA</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="quantity">Quantidade:</label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={handleQuantityChange}
            min="0"
            className="input-number"
          />
          <p className="refresh-stock">Stock atual: {currentStock}</p>
        </div>
        <button type="submit" className="submit-button">
          Adicionar
        </button>
      </form>
    </div>
  );
};

export default AddStock;