import React, { useState, useEffect } from "react";
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiGift, FiCalendar, FiDollarSign, FiUsers, FiLink, FiShare2, FiEye } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import api from "../services/api";

const Rifas = () => {
    const navigate = useNavigate();
    const [rifas, setRifas] = useState([]);
    const [filteredRifas, setFilteredRifas] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingRifa, setEditingRifa] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        titulo: "",
        descricao: "",
        premio: "",
        valorBilhete: "",
        quantidadeBilhetes: "",
        dataInicio: "",
        dataFim: "",
        imagemUrl: "",
        status: "ativa"
    });

    useEffect(() => {
        fetchRifas();
    }, []);

    useEffect(() => {
        const filtered = rifas.filter(
            rifa =>
                rifa.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                rifa.premio.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredRifas(filtered);
    }, [searchTerm, rifas]);

    const fetchRifas = async () => {
        try {
            const response = await api.get("/rifas");
            setRifas(response.data.rifas || []);
            setFilteredRifas(response.data.rifas || []);
            setLoading(false);
        } catch (error) {
            setError("Erro ao carregar rifas");
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formDataToSend = new FormData();

            // Adicionar campos de texto
            formDataToSend.append('titulo', formData.titulo);
            formDataToSend.append('descricao', formData.descricao);
            formDataToSend.append('premio', formData.premio);
            formDataToSend.append('valorBilhete', parseFloat(formData.valorBilhete));
            formDataToSend.append('quantidadeNumeros', parseInt(formData.quantidadeBilhetes));
            formDataToSend.append('dataInicio', formData.dataInicio);
            formDataToSend.append('dataFim', formData.dataFim);
            formDataToSend.append('status', formData.status);

            // Adicionar imagem se foi selecionada
            if (formData.imagem) {
                formDataToSend.append('imagem', formData.imagem);
            }

            if (editingRifa) {
                await api.put(`/rifas/${editingRifa.id}`, formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                await api.post("/rifas", formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }
            fetchRifas();
            setShowModal(false);
            resetForm();
        } catch (error) {
            setError("Erro ao salvar rifa");
        }
    };

    const handleEdit = (rifa) => {
        setEditingRifa(rifa);
        setFormData({
            titulo: rifa.titulo,
            descricao: rifa.descricao,
            premio: rifa.premio,
            valorBilhete: rifa.valorBilhete.toString(),
            quantidadeBilhetes: rifa.quantidadeBilhetes.toString(),
            dataInicio: rifa.dataInicio,
            dataFim: rifa.dataFim,
            imagemUrl: rifa.imagemUrl || "",
            imagem: null,
            status: rifa.status
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Tem certeza que deseja excluir esta rifa?")) {
            try {
                await api.delete(`/rifas/${id}`);
                fetchRifas();
            } catch (error) {
                setError("Erro ao excluir rifa");
            }
        }
    };

    const resetForm = () => {
        setFormData({
            titulo: "",
            descricao: "",
            premio: "",
            valorBilhete: "",
            quantidadeBilhetes: "",
            dataInicio: "",
            dataFim: "",
            imagemUrl: "",
            imagem: null,
            status: "ativa"
        });
        setEditingRifa(null);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "ativa":
                return "bg-green-100 text-green-800";
            case "finalizada":
                return "bg-gray-100 text-gray-800";
            case "cancelada":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Rifas</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <FiPlus size={20} />
                    Nova Rifa
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-4">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Pesquisar rifas..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRifas.map((rifa) => (
                        <div key={rifa.id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                            <FiGift className="text-white" size={20} />
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-lg font-semibold text-gray-900">{rifa.titulo}</h3>
                                            <p className="text-sm text-gray-600">{rifa.premio}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rifa.status)}`}>
                                        {rifa.status}
                                    </span>
                                </div>

                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{rifa.descricao}</p>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <FiDollarSign className="mr-2" size={16} />
                                        Valor: R$ {rifa.valorBilhete}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <FiUsers className="mr-2" size={16} />
                                        Bilhetes: {rifa.quantidadeBilhetes}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <FiCalendar className="mr-2" size={16} />
                                        Fim: {new Date(rifa.dataFim).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => navigate(`/rifas/${rifa.id}`)}
                                            className="text-purple-600 hover:text-purple-900"
                                            title="Ver detalhes da rifa"
                                        >
                                            <FiEye size={16} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                const link = `${window.location.origin}/rifa/${rifa.id}`;
                                                navigator.clipboard.writeText(link);
                                                alert('Link da rifa copiado para a área de transferência!');
                                            }}
                                            className="text-green-600 hover:text-green-900"
                                            title="Copiar link público da rifa"
                                        >
                                            <FiLink size={16} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                const link = `${window.location.origin}/rifa/${rifa.id}`;
                                                if (navigator.share) {
                                                    navigator.share({
                                                        title: rifa.titulo,
                                                        text: `Participe da rifa: ${rifa.titulo}`,
                                                        url: link
                                                    });
                                                } else {
                                                    navigator.clipboard.writeText(link);
                                                    alert('Link copiado para a área de transferência!');
                                                }
                                            }}
                                            className="text-blue-500 hover:text-blue-700"
                                            title="Compartilhar rifa"
                                        >
                                            <FiShare2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleEdit(rifa)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            <FiEdit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(rifa.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        ID: {rifa.id}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal para criar/editar rifa */}
            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    resetForm();
                }}
                title={editingRifa ? "Editar Rifa" : "Nova Rifa"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Título *
                            </label>
                            <input
                                type="text"
                                name="titulo"
                                value={formData.titulo}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Descrição *
                            </label>
                            <textarea
                                name="descricao"
                                value={formData.descricao}
                                onChange={handleInputChange}
                                required
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Prêmio *
                            </label>
                            <input
                                type="text"
                                name="premio"
                                value={formData.premio}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Valor do Bilhete *
                            </label>
                            <input
                                type="number"
                                name="valorBilhete"
                                value={formData.valorBilhete}
                                onChange={handleInputChange}
                                required
                                step="0.01"
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Quantidade de Bilhetes *
                            </label>
                            <input
                                type="number"
                                name="quantidadeBilhetes"
                                value={formData.quantidadeBilhetes}
                                onChange={handleInputChange}
                                required
                                min="1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Data de Início *
                            </label>
                            <input
                                type="date"
                                name="dataInicio"
                                value={formData.dataInicio}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Data de Fim *
                            </label>
                            <input
                                type="date"
                                name="dataFim"
                                value={formData.dataFim}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Imagem do Produto
                            </label>
                            <input
                                type="file"
                                name="imagem"
                                accept="image/*"
                                onChange={(e) => {
                                    setFormData({
                                        ...formData,
                                        imagem: e.target.files[0]
                                    });
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Formatos aceitos: JPG, PNG, GIF (máx. 5MB)
                            </p>
                            {/* Preview da imagem */}
                            {(formData.imagem || (editingRifa && editingRifa.imagemUrl)) && (
                                <div className="mt-3">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                                    <img
                                        src={
                                            formData.imagem
                                                ? URL.createObjectURL(formData.imagem)
                                                : `http://localhost:5000${editingRifa?.imagemUrl}`
                                        }
                                        alt="Preview"
                                        className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                                    />
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status *
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="ativa">Ativa</option>
                                <option value="finalizada">Finalizada</option>
                                <option value="cancelada">Cancelada</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={() => {
                                setShowModal(false);
                                resetForm();
                            }}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                            {editingRifa ? "Atualizar" : "Criar"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Rifas;
