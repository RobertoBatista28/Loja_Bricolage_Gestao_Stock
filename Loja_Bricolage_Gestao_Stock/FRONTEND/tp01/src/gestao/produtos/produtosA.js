import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import "./produtosA.css";

const AdicionarProduto = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm();

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    const onSubmit = async (data) => {
        try {
            const cookieValue = decodeURIComponent(document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, "$1"));
            let token = '';
            try {
                const parsedCookie = JSON.parse(cookieValue.replace(/^j:/, ''));
                token = parsedCookie.token;
            } catch (error) {
                console.error('Erro ao extrair token do cookie:', error);
                alert("Você precisa estar logado/ter permissões para adicionar um livro.");
                navigate("/login");
                return;
            }

            const file = data.imagem[0];
            const base64Image = await convertToBase64(file);
            data.imagem = base64Image;

            const response = await fetch("http://127.0.0.1:3001/menu/produtos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-access-token": `Bearer ${token}`,
                },
                credentials: "include",
                body: JSON.stringify(data)
            });

            if (response.ok) {
                alert("Produto adicionado com sucesso!");
                navigate("/produtos");
            } else {
                const errorData = await response.json();
                alert(`Erro ao criar um produto: ${errorData.message}`);
            }
        } catch (err) {
            console.error("Erro ao adicionar produto:", err);
            alert("Erro ao adicionar produto. Por favor, tente novamente.");
        }
    };

    return (
        <div className="adicionarProdutoForm">
            <h2>Adicionar Produto</h2>
            <form className="form-adicionar-produto" onSubmit={handleSubmit(onSubmit)}>
                <div className="field">
                    <label>Referência:</label>
                    <input className="referencia" {...register("referencia", { required: true })} />
                    {errors.referencia && <span className="error-message">Este campo é obrigatório.</span>}
                </div>
                <div className="field">
                    <label>Nome do produto:</label>
                    <input className="nomeProduto" {...register("nome", { required: true })} />
                    {errors.nomeProduto && <span className="error-message">Este campo é obrigatório.</span>}
                </div>
                <div className="field">
                    <label>Descrição:</label>
                    <textarea className="descricao" {...register("descricao", { required: true })} />
                    {errors.descricao && <span className="error-message">Este campo é obrigatório.</span>}
                </div>
                <div className="field">
                    <label>Preço:</label>
                    <input className="preco" type="number" step="0.01" {...register("preco", { required: true, min: 0 })} />
                    {errors.preco && errors.preco.type === "required" && <span className="error-message">Este campo é obrigatório.</span>}
                    {errors.preco && errors.preco.type === "min" && <span className="error-message">O preço deve ser maior ou igual a 0.</span>}
                </div>
                <div className="field">
                    <label>Categoria:</label>
                    <input className="categoria" {...register("categoria", { required: true })} />
                    {errors.categoria && <span className="error-message">Este campo é obrigatório.</span>}
                </div>
                <div className="field">
                    <label>Imagem:</label>
                    <input className="imagem" type="file" {...register("imagem", { required: true })} />
                    {errors.imagem && <span className="error-message">Este campo é obrigatório.</span>}
                </div>
                <input className="submit" type="submit" value="Adicionar Produto" />
            </form>
            <div className="login-link">
                <Link to="/produtos">🡸 Voltar para a lista de produtos</Link>
            </div>
        </div>
    );
};

export default AdicionarProduto;
