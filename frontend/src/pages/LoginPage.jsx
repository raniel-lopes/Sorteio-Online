import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function LoginPage() {
    const [usuario, setUsuario] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");
    const [loading, setLoading] = useState(false);
    const [mostrarSenha, setMostrarSenha] = useState(false); // Novo estado

    const handleLogin = async (e) => {
        e.preventDefault();
        setErro("");
        setLoading(true);

        try {
            const response = await fetch("https://sorteio-online-production.up.railway.app/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ usuario, senha }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("token", data.token); // Salva o token
                localStorage.setItem("perfil", data.perfil); // Salva o perfil
                localStorage.setItem("nome", data.nome); // Salva o nome do usuário
                window.location.href = "/dashboard"; // Redireciona para o dashboard
            } else {
                setErro("Usuário ou senha inválidos.");
            }
        } catch (err) {

            setErro("Erro ao conectar com o servidor.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen w-screen bg-green-200">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                {/* Logo do sistema */}
                <div className="flex justify-center mb-1">
                    <img
                        src="./images/Sorteio-online.png"
                        alt="Logo Sorteio Online"
                        className="h-45 w-auto"
                    />
                </div>
                <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">
                    Sistema de Sorteios Online
                </h1>
                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Usuário</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                            placeholder="Digite seu usuário"
                            value={usuario}
                            onChange={e => setUsuario(e.target.value)}
                            autoComplete="username"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Senha</label>
                        <div className="relative">
                            <input
                                type={mostrarSenha ? "text" : "password"}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                                placeholder="Digite sua senha"
                                value={senha}
                                onChange={e => setSenha(e.target.value)}
                                autoComplete="current-password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setMostrarSenha(!mostrarSenha)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                tabIndex={-1}
                            >
                                {mostrarSenha ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                    </div>
                    {erro && <div className="text-red-600 mb-2">{erro}</div>}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-60"
                        disabled={loading}
                    >
                        {loading ? "Entrando..." : "Entrar"}
                    </button>
                </form>
            </div>
        </div>
    );
}