import React, { useEffect, useState } from "react";
import { FiMoreVertical, FiTrash2, FiUserPlus, FiEdit2, FiSave, FiX } from "react-icons/fi";

export default function UsuariosPage() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [novoUsuario, setNovoUsuario] = useState({
        email: "",
        nome: "",
        celular: "",
        cidade: "",
        estado: "",
        senha: "",
        perfil: "livre"
    });
    const [editId, setEditId] = useState(null);
    const [editData, setEditData] = useState({});
    const [menuOpenId, setMenuOpenId] = useState(null);
    const token = localStorage.getItem("token");
    const perfil = localStorage.getItem("perfil");

    // Só admin pode acessar
    if (perfil !== "admin") {
        return (
            <div className="p-8 text-center text-red-600 font-bold text-xl">
                Acesso restrito. Apenas administradores podem acessar esta página.
            </div>
        );
    }

    // Buscar usuários
    useEffect(() => {
        async function fetchUsuarios() {
            setLoading(true);
            const res = await fetch("http://localhost:5000/api/usuarios", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                console.log(data); // <-- Adicione esta linha
                setUsuarios(data);
            }
            setLoading(false);
        }
        fetchUsuarios();
    }, [token]);

    // Função para abrir modal
    function abrirModal() {
        setNovoUsuario({ email: "", nome: "", celular: "", cidade: "", estado: "", senha: "", perfil: "livre" });
        setShowModal(true);
    }

    // Função para fechar modal
    function fecharModal() {
        setShowModal(false);
    }

    // Adicionar usuário
    async function handleAddUsuario(e) {
        e.preventDefault();
        // Adapte para seu backend: envie perfil como "admin" se livre, "usuario" se restrito
        const payload = {
            ...novoUsuario,
            perfil: novoUsuario.perfil === "livre" ? "admin" : "usuario"
        };
        const res = await fetch("http://localhost:5000/api/usuarios", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            setShowModal(false);
            setNovoUsuario({ email: "", nome: "", celular: "", cidade: "", estado: "", senha: "", perfil: "livre" });
            const data = await res.json();
            setUsuarios((prev) => [...prev, data]);
        } else {
            alert("Erro ao criar usuário.");
        }
    }

    // Remover usuário
    async function handleDeleteUsuario(id) {
        if (!window.confirm("Tem certeza que deseja remover este usuário?")) return;
        const res = await fetch(`http://localhost:5000/api/usuarios/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            setUsuarios((prev) => prev.filter(u => u.id !== id));
        } else {
            alert("Erro ao remover usuário.");
        }
    }

    // Editar usuário
    function startEdit(u) {
        setEditId(u.id);
        setEditData({ ...u });
    }
    function cancelEdit() {
        setEditId(null);
        setEditData({});
    }
    async function saveEdit(id) {
        const res = await fetch(`http://localhost:5000/api/usuarios/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(editData)
        });
        if (res.ok) {
            setUsuarios((prev) => prev.map(u => u.id === id ? { ...u, ...editData } : u));
            setEditId(null);
            setEditData({});
        } else {
            alert("Erro ao atualizar usuário.");
        }
    }

    return (
        <>
            {/* Modal de cadastro com fundo borrado - FORA do container principal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <div className="bg-white rounded shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 relative">
                        <button
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
                            onClick={fecharModal}
                        >
                            <FiX size={22} />
                        </button>
                        <h2 className="text-xl font-bold mb-4">Cadastro de usuário</h2>
                        <form onSubmit={handleAddUsuario}>
                            <div className="mb-3">
                                <label className="block text-gray-700 mb-1">Email *</label>
                                <input
                                    type="email"
                                    className="w-full border rounded px-3 py-2"
                                    required
                                    value={novoUsuario.email}
                                    onChange={e => setNovoUsuario({ ...novoUsuario, email: e.target.value })}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="block text-gray-700 mb-1">Nome Completo *</label>
                                <input
                                    className="w-full border rounded px-3 py-2"
                                    required
                                    value={novoUsuario.nome}
                                    onChange={e => setNovoUsuario({ ...novoUsuario, nome: e.target.value })}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="block text-gray-700 mb-1">Celular *</label>
                                <input
                                    className="w-full border rounded px-3 py-2"
                                    required
                                    placeholder="(DDD) 00000-0000"
                                    value={novoUsuario.celular}
                                    onChange={e => setNovoUsuario({ ...novoUsuario, celular: e.target.value })}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="block text-gray-700 mb-1">Cidade *</label>
                                <input
                                    className="w-full border rounded px-3 py-2"
                                    required
                                    value={novoUsuario.cidade}
                                    onChange={e => setNovoUsuario({ ...novoUsuario, cidade: e.target.value })}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="block text-gray-700 mb-1">Estado *</label>
                                <input
                                    className="w-full border rounded px-3 py-2"
                                    required
                                    value={novoUsuario.estado}
                                    onChange={e => setNovoUsuario({ ...novoUsuario, estado: e.target.value })}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="block text-gray-700 mb-1">Senha *</label>
                                <input
                                    type="password"
                                    className="w-full border rounded px-3 py-2"
                                    required
                                    value={novoUsuario.senha}
                                    onChange={e => setNovoUsuario({ ...novoUsuario, senha: e.target.value })}
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-700 mb-1">Perfil *</label>
                                <select
                                    className="w-full border rounded px-3 py-2"
                                    value={novoUsuario.perfil}
                                    onChange={e => setNovoUsuario({ ...novoUsuario, perfil: e.target.value })}
                                    required
                                >
                                    <option value="livre">Livre</option>
                                    <option value="restrito">Restrito</option>
                                </select>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-6 py-2 rounded font-semibold"
                                >
                                    Continuar
                                </button>
                                <button
                                    type="button"
                                    className="border px-6 py-2 rounded font-semibold"
                                    onClick={fecharModal}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Conteúdo principal */}
            <div className="p-6">
                <div className="flex items-center mb-2">
                    <h2 className="text-2xl font-bold text-gray-800 mr-4">Usuários</h2>
                    <span className="text-blue-600 mx-2">Visão Geral</span>
                    <span className="mx-2 text-gray-400">{'>'}</span>
                    <span className="text-gray-500">Usuários</span>
                </div>

                <div className="bg-white rounded shadow p-6">
                    <div className="flex flex-wrap gap-4 items-end mb-4">
                        <button
                            className="ml-auto bg-blue-600 text-white px-5 py-2 rounded font-semibold flex items-center gap-2"
                            onClick={abrirModal}
                        >
                            <FiUserPlus /> Novo Usuário
                        </button>
                    </div>

                    <div className="overflow-visible">
                        <table className="min-w-full text-left">
                            <thead>
                                <tr className="bg-gray-100 text-gray-600 text-sm">
                                    <th className="py-2 px-4 font-semibold">NOME</th>
                                    <th className="py-2 px-4 font-semibold">USUÁRIO</th>
                                    <th className="py-2 px-4 font-semibold">PERFIL</th>
                                    <th className="py-2 px-4 font-semibold">EMAIL</th>
                                    <th className="py-2 px-4 font-semibold">ÚLTIMO ACESSO</th>
                                    <th className="py-2 px-4 font-semibold">AÇÕES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-4">Carregando...</td>
                                    </tr>
                                ) : usuarios.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-4">Nenhum usuário encontrado.</td>
                                    </tr>
                                ) : usuarios.map(u => (
                                    editId === u.id ? (
                                        <tr key={u.id} className="border-b">
                                            <td className="py-2 px-4">
                                                <input className="border rounded px-2 py-1 text-sm" value={editData.nome} onChange={e => setEditData({ ...editData, nome: e.target.value })} />
                                            </td>
                                            <td className="py-2 px-4">
                                                <input className="border rounded px-2 py-1 text-sm" value={editData.usuario} onChange={e => setEditData({ ...editData, usuario: e.target.value })} />
                                            </td>
                                            <td className="py-2 px-4">
                                                <select className="border rounded px-2 py-1 text-sm" value={editData.perfil} onChange={e => setEditData({ ...editData, perfil: e.target.value })}>
                                                    <option value="usuario">Usuário</option>
                                                    <option value="admin">Admin</option>
                                                    <option value="chefe">Chefe</option>
                                                </select>
                                            </td>
                                            <td className="py-2 px-4">
                                                <input className="border rounded px-2 py-1 text-sm" value={editData.email} onChange={e => setEditData({ ...editData, email: e.target.value })} />
                                            </td>
                                            <td className="py-2 px-4">
                                                {u.ultimoAcesso ? new Date(u.ultimoAcesso).toLocaleDateString('pt-BR') : "-"}
                                            </td>
                                            <td className="py-2 px-4 text-right">
                                                <div className="flex gap-2 justify-end">
                                                    <button className="text-green-600 hover:text-green-800" onClick={() => saveEdit(u.id)} title="Salvar"><FiSave /></button>
                                                    <button className="text-gray-500 hover:text-gray-700" onClick={cancelEdit} title="Cancelar"><FiX /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        <tr key={u.id} className="border-b">
                                            <td className="py-2 px-4">{u.nome}</td>
                                            <td className="py-2 px-4">{u.usuario}</td>
                                            <td className="py-2 px-4">{u.perfil}</td>
                                            <td className="py-2 px-4">{u.email}</td>
                                            <td className="py-2 px-4">
                                                {u.ultimoAcesso ? new Date(u.ultimoAcesso).toLocaleDateString('pt-BR') : "-"}
                                            </td>
                                            <td className="py-2 px-4 text-right relative">
                                                <button
                                                    className="text-gray-500 hover:text-gray-700"
                                                    onClick={() => setMenuOpenId(u.id === menuOpenId ? null : u.id)}
                                                >
                                                    <FiMoreVertical size={20} />
                                                </button>
                                                {menuOpenId === u.id && (
                                                    <div className="absolute right-0 mt-2 w-44 bg-white rounded shadow z-50 border py-2">
                                                        <button
                                                            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 w-full"
                                                            onClick={() => {
                                                                setMenuOpenId(null);
                                                                startEdit(u);
                                                            }}
                                                        >
                                                            <FiEdit2 size={18} />
                                                            <span>Editar</span>
                                                        </button>
                                                        <button
                                                            className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 w-full"
                                                            onClick={() => {
                                                                setMenuOpenId(null);
                                                                handleDeleteUsuario(u.id);
                                                            }}
                                                        >
                                                            <FiTrash2 size={18} />
                                                            <span>Deletar</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}