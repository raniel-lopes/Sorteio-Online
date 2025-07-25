import React, { useState, useRef, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import { FiBell, FiChevronDown, FiUser, FiLogOut } from "react-icons/fi";

import Sidebar from "./components/Sidebar";
import DashboardPage from "./pages/DashboardPage";
import Participantes from "./pages/Participantes";
import Rifas from "./pages/Rifas";
import RifaDetalhes from "./pages/RifaDetalhes";
import Pagamentos from "./pages/Pagamentos";
import LoginPage from "./pages/LoginPage";
import UsuariosPage from "./pages/UsuariosPage";
import MeuPerfil from "./pages/MeuPerfil";
import RifaPublica from "./pages/RifaPublica";
import PagamentoPix from "./pages/PagamentoPix";
import ConfirmarPagamento from "./pages/ConfirmarPagamento";
import ValidarPagamentos from "./pages/ValidarPagamentos";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Fecha o menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const nomeUsuario = localStorage.getItem("nome") || "Usuário";
  const perfilUsuario = localStorage.getItem("perfil") || "visualizador";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("perfil");
    localStorage.removeItem("nome");
    window.location.href = "/";
  };

  return (
    <Router>
      <Routes>
        {/* Página de login */}
        <Route path="/" element={<LoginPage />} />

        {/* Rotas públicas sem autenticação e sem layout do sistema */}
        <Route path="/rifa/:slug" element={<RifaPublica />} />
        <Route path="/rifa/id/:id" element={<RifaPublica />} />

        {/* Página de pagamento PIX - sem layout do sistema */}
        <Route path="/pagamento/:id" element={<PagamentoPix />} />

        {/* Página de confirmação de pagamento - sem layout do sistema */}
        <Route path="/confirmar-pagamento/:participanteId" element={<ConfirmarPagamento />} />

        {/* Rotas protegidas com layout do sistema */}
        <Route
          path="*"
          element={
            <div className="h-screen w-screen flex bg-gray-100">
              <Sidebar />
              <div className="flex-1 flex flex-col">
                <header className="flex justify-between items-center bg-white shadow p-4">
                  <h1 className="text-2xl font-bold text-gray-800">🎯 Sorteios Online</h1>
                  <div className="relative flex items-center gap-4">
                    {/* Ícone de notificações */}
                    <button className="relative">
                      <FiBell size={22} className="text-gray-600 hover:text-blue-600" />
                      <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-1.5">3</span>
                    </button>

                    {/* Badge do perfil */}
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${perfilUsuario === 'admin' ? 'bg-red-100 text-red-800' :
                        perfilUsuario === 'vendedor' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                        {perfilUsuario === 'admin' ? 'Administrador' :
                          perfilUsuario === 'vendedor' ? 'Vendedor' : 'Visualizador'}
                      </span>
                    </div>

                    {/* Botão do perfil */}
                    <div className="relative" ref={menuRef}>
                      <button
                        className="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-100"
                        onClick={() => setMenuOpen((open) => !open)}
                      >
                        <span>{nomeUsuario}</span>
                        <FiChevronDown size={16} />
                      </button>
                      {menuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-40 bg-white border rounded shadow z-10">
                          <button
                            className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                            onClick={() => {
                              setMenuOpen(false);
                              window.location.href = "/meu-perfil";
                            }}
                          >
                            <span className="mr-2">
                              <FiUser size={18} />
                            </span>
                            Meu Perfil
                          </button>
                          <button
                            className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                            onClick={handleLogout}
                          >
                            <span className="mr-2">
                              <FiLogOut size={18} />
                            </span>
                            Sair
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </header>
                <main className="flex-1 overflow-y-auto p-6">
                  <Routes>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/participantes" element={<Participantes />} />
                    <Route path="/rifas" element={<Rifas />} />
                    <Route path="/rifas/:id" element={<RifaDetalhes />} />
                    <Route path="/pagamentos" element={<Pagamentos />} />
                    <Route path="/pagamentos/validar" element={<ValidarPagamentos />} />
                    <Route path="/usuarios" element={<UsuariosPage />} />
                    <Route path="/meu-perfil" element={<MeuPerfil />} />
                  </Routes>
                </main>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;