import './App.css';
import { Route, Routes } from "react-router-dom";
import LoginForm from './login/LoginForm';
import Registar from "./registar/registarForm";
import Header from "./header/Header";
import Produtos from "./produto/Produtos";
import Produto from "./produto/Produto";
import Recover from "./recover/recoverForm";
import Reset from "./recover/resetForm";
import Utilizador from "./utilizador/utilizador";
import Editar from "./utilizador/editar";
import Password from "./utilizador/password";
import GestaoProduto from "./gestao/produtos/produtosG";
import AdicionarProduto from "./gestao/produtos/produtosA";
import UserList from "./gestao/utilizadores/UserList";
import UserVendaDetail from "./vendas/vendaDetail";
import UserVendaList from "./vendas/userVendaList";
import AdminVendaList from "./gestao/vendas/adminVendaList";
import AdminVendaEdit from "./gestao/vendas/VendaEdit";
import AdminVendaDetail from "./gestao/vendas/VendaDetail";
import UserEdit from "./gestao/utilizadores/UserEdit";
import UserProfile from "./gestao/utilizadores/UserProfile";
import Carrinho from "./carrinho/Carrinho";
import Stock from "./gestao/stocks/Stocks";
import Compra from "./compra/Compra";

import NotFound from "./404/404";

function App() {
  return (
    <div className="App">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Produtos />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/registar" element={<Registar />} />
          <Route path="/recover" element={<Recover />} />
          <Route path="/reset" element={<Reset />} />
          <Route path="/me" element={<Utilizador />} />
          <Route path="/me/editar" element={<Editar />} />
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/produtos/:referencia" element={<Produto />} />
          <Route path="/me/editar/password" element={<Password />} />
          <Route path="/admin/produto/:referencia" element={<GestaoProduto />} />
          <Route path="/admin/produtos/adicionar" element={<AdicionarProduto />} />
          <Route path="/admin/users" element={<UserList />} />
          <Route path="/admin/users/:username" element={<UserProfile />} />
          <Route path="/admin/users/edit/:username" element={<UserEdit />} />
          <Route path="/admin/vendas" element={<AdminVendaList />} />
          <Route path="/admin/vendas/:nrVenda" element={<AdminVendaDetail />} />
          <Route path="/admin/vendas/edit/:nrVenda" element={<AdminVendaEdit />} />
          <Route path="/:username/vendas" element={<UserVendaList />} />
          <Route path="/:username/vendas/:nrVenda" element={<UserVendaDetail />} />
          <Route path="/carrinho" element={<Carrinho />} />
          <Route path="/admin/stock/adicionar/:referencia" element={<Stock />} />
          <Route path="/compra" element={<Compra />} />
          <Route path="/*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
