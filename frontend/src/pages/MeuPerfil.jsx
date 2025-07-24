import React, { useState } from "react";
import { FiUser, FiLock, FiLink, FiSettings, FiEye, FiEyeOff } from "react-icons/fi";

export default function MeuPerfil() {
    const [aba, setAba] = useState("dados");
    const [nome, setNome] = useState(localStorage.getItem("nome") || "");
    const [email, setEmail] = useState(""); // Busque do backend se já existir
    const [meta, setMeta] = useState("");   // Busque do backend se já existir
    const [novaSenha, setNovaSenha] = useState("");
    const [repetirSenha, setRepetirSenha] = useState("");
    const [mostrarSenha, setMostrarSenha] = useState(false);

    // Funções para salvar alterações e mudar senha (implemente chamadas ao backend)
    const handleSalvarDados = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("https://sorteio-online-production.up.railway.app/api/usuarios/me", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ nome, email, meta }),
            });
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("nome", data.nome); // Atualiza nome local
                alert("Dados salvos!");
            } else {
                alert("Erro ao salvar dados.");
            }
        } catch {
            alert("Erro ao conectar ao servidor.");
        }
    };

    const handleAlterarSenha = async (e) => {
        e.preventDefault();
        if (novaSenha !== repetirSenha) {
            alert("As senhas não coincidem!");
            return;
        }
        try {
            const response = await fetch("https://sorteio-online-production.up.railway.app/api/usuarios/me/senha", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ senha: novaSenha }),
            });
            if (response.ok) {
                alert("Senha alterada!");
                setNovaSenha("");
                setRepetirSenha("");
            } else {
                alert("Erro ao alterar senha.");
            }
        } catch {
            alert("Erro ao conectar ao servidor.");
        }
    };

    return (
        <div className="flex p-8">
            {/* Sidebar de abas */}
            <div className="w-64 mr-8">
                <div className="flex flex-col gap-2">
                    <button
                        className={`flex items-center gap-2 px-4 py-3 rounded ${aba === "dados" ? "bg-blue-600 text-white" : "hover:bg-gray-100 text-gray-700"}`}
                        onClick={() => setAba("dados")}
                    >
                        <FiUser size={20} /> Dados Pessoais
                    </button>
                    <button
                        className={`flex items-center gap-2 px-4 py-3 rounded ${aba === "senha" ? "bg-blue-600 text-white" : "hover:bg-gray-100 text-gray-700"}`}
                        onClick={() => setAba("senha")}
                    >
                        <FiLock size={20} /> Mudar Senha
                    </button>
                    <button
                        className={`flex items-center gap-2 px-4 py-3 rounded ${aba === "social" ? "bg-blue-600 text-white" : "hover:bg-gray-100 text-gray-700"}`}
                        onClick={() => setAba("social")}
                    >
                        <FiLink size={20} /> Social
                    </button>
                    <button
                        className={`flex items-center gap-2 px-4 py-3 rounded ${aba === "config" ? "bg-blue-600 text-white" : "hover:bg-gray-100 text-gray-700"}`}
                        onClick={() => setAba("config")}
                    >
                        <FiSettings size={20} /> Configurações
                    </button>
                </div>
            </div>

            {/* Conteúdo da aba selecionada */}
            <div className="flex-1 bg-white rounded shadow p-8">
                {aba === "dados" && (
                    <form onSubmit={handleSalvarDados} className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block mb-2 text-gray-700">Nome</label>
                            <input className="w-full border rounded px-4 py-2" value={nome} onChange={e => setNome(e.target.value)} />
                        </div>
                        <div>
                            <label className="block mb-2 text-gray-700">Email</label>
                            <input className="w-full border rounded px-4 py-2" value={email} onChange={e => setEmail(e.target.value)} />
                        </div>
                        <div>
                            <label className="block mb-2 text-gray-700">Meta</label>
                            <input className="w-full border rounded px-4 py-2" value={meta} onChange={e => setMeta(e.target.value)} />
                        </div>
                        <div className="col-span-2 flex gap-4 mt-4">
                            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded">Salvar Alterações</button>
                            <button type="button" className="bg-red-500 text-white px-6 py-2 rounded">Excluir Conta</button>
                        </div>
                    </form>
                )}

                {aba === "senha" && (
                    <form onSubmit={handleAlterarSenha} className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block mb-2 text-gray-700">Nova senha</label>
                            <div className="relative">
                                <input
                                    type={mostrarSenha ? "text" : "password"}
                                    className="w-full border rounded px-4 py-2 pr-10" // pr-10 para espaço do ícone
                                    value={novaSenha}
                                    onChange={e => setNovaSenha(e.target.value)}
                                    placeholder=".........."
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                    onClick={() => setMostrarSenha(!mostrarSenha)}
                                    tabIndex={-1}
                                >
                                    {mostrarSenha ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block mb-2 text-gray-700">Repita a nova senha</label>
                            <div className="relative">
                                <input
                                    type={mostrarSenha ? "text" : "password"}
                                    className="w-full border rounded px-4 py-2 pr-10" // pr-10 para espaço do ícone
                                    value={repetirSenha}
                                    onChange={e => setRepetirSenha(e.target.value)}
                                    placeholder=".........."
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                    onClick={() => setMostrarSenha(!mostrarSenha)}
                                    tabIndex={-1}
                                >
                                    {mostrarSenha ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>
                        <div className="col-span-2 mt-4">
                            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded">Salvar Alterações</button>
                        </div>
                    </form>
                )}

                {/* Implemente as abas Social e Configurações conforme necessário */}
            </div>
        </div>
    );
}