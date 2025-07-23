import React, { useState, useEffect } from "react";
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiPlay, FiAward, FiCalendar, FiUsers } from "react-icons/fi";
import Modal from "../components/Modal";
import api from "../services/api";

const Sorteios = () => {
    const [sorteios, setSorteios] = useState([]);
    const [filteredSorteios, setFilteredSorteios] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingSorteio, setEditingSorteio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rifas, setRifas] = useState([]);

    const [formData, setFormData] = useState({
        rifaId: "",
        dataSorteio: "",
        numeroSorteado: "",
        status: "pendente"
    });

    useEffect(() => {
        fetchSorteios();
        fetchRifas();
    }, []);

    useEffect(() => {
        const filtered = sorteios.filter(
            sorteio =>
                sorteio.Rifa?.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sorteio.numeroSorteado?.toString().includes(searchTerm)
        );
        setFilteredSorteios(filtered);
    }, [searchTerm, sorteios]);

    const fetchSorteios = async () => {
        try {
            const response = await api.get("/sorteios");
            setSorteios(response.data);
            setFilteredSorteios(response.data);
            setLoading(false);
        } catch (error) {
            setError("Erro ao carregar sorteios");
            setLoading(false);
        }
    };

    const fetchRifas = async () => {
        try {
            const response = await api.get("/rifas");
            setRifas(response.data);
        } catch (error) {
            console.error("Erro ao carregar rifas:", error);
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
            const dataToSend = {
                ...formData,
                rifaId: parseInt(formData.rifaId),
                numeroSorteado: formData.numeroSorteado ? parseInt(formData.numeroSorteado) : null
            };

            if (editingSorteio) {
                await api.put(`/sorteios/${editingSorteio.id}`, dataToSend);
            } else {
                await api.post("/sorteios", dataToSend);
            }
            fetchSorteios();
            setShowModal(false);
            resetForm();
        } catch (error) {
            setError("Erro ao salvar sorteio");
        }
    };

    const handleEdit = (sorteio) => {
        setEditingSorteio(sorteio);
        setFormData({
            rifaId: sorteio.rifaId.toString(),
            dataSorteio: sorteio.dataSorteio,
            numeroSorteado: sorteio.numeroSorteado ? sorteio.numeroSorteado.toString() : "",
            status: sorteio.status
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Tem certeza que deseja excluir este sorteio?")) {
            try {
                await api.delete(`/sorteios/${id}`);
                fetchSorteios();
            } catch (error) {
                setError("Erro ao excluir sorteio");
            }
        }
    };

    const handleRealizarSorteio = async (id) => {
        if (window.confirm("Tem certeza que deseja realizar este sorteio?")) {
            try {
                await api.post(`/sorteios/${id}/realizar`);
                fetchSorteios();
            } catch (error) {
                setError("Erro ao realizar sorteio");
            }
        }
    };

    const resetForm = () => {
        setFormData({
            rifaId: "",
            dataSorteio: "",
            numeroSorteado: "",
            status: "pendente"
        });
        setEditingSorteio(null);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "realizado":
                return "bg-green-100 text-green-800";
            case "pendente":
                return "bg-yellow-100 text-yellow-800";
            case "cancelado":
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
                <h1 className="text-2xl font-bold text-gray-800">Sorteios</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <FiPlus size={20} />
                    Novo Sorteio
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
                            placeholder="Pesquisar sorteios..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSorteios.map((sorteio) => (
                        <div key={sorteio.id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                                            <FiAward className="text-white" size={20} />
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-lg font-semibold text-gray-900">{sorteio.Rifa?.titulo}</h3>
                                            <p className="text-sm text-gray-600">Sorteio #{sorteio.id}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sorteio.status)}`}>
                                        {sorteio.status}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <FiCalendar className="mr-2" size={16} />
                                        Data: {new Date(sorteio.dataSorteio).toLocaleDateString()}
                                    </div>
                                    {sorteio.numeroSorteado && (
                                        <div className="flex items-center text-sm text-gray-600">
                                            <FiUsers className="mr-2" size={16} />
                                            Número sorteado: {sorteio.numeroSorteado}
                                        </div>
                                    )}
                                    <div className="flex items-center text-sm text-gray-600">
                                        <FiAward className="mr-2" size={16} />
                                        Prêmio: {sorteio.Rifa?.premio}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEdit(sorteio)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            <FiEdit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(sorteio.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                        {sorteio.status === "pendente" && (
                                            <button
                                                onClick={() => handleRealizarSorteio(sorteio.id)}
                                                className="text-green-600 hover:text-green-900"
                                                title="Realizar sorteio"
                                            >
                                                <FiPlay size={16} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {new Date(sorteio.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal para criar/editar sorteio */}
            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    resetForm();
                }}
                title={editingSorteio ? "Editar Sorteio" : "Novo Sorteio"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Rifa *
                            </label>
                            <select
                                name="rifaId"
                                value={formData.rifaId}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Selecione uma rifa</option>
                                {rifas.map((rifa) => (
                                    <option key={rifa.id} value={rifa.id}>
                                        {rifa.titulo} - {rifa.premio}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Data do Sorteio *
                            </label>
                            <input
                                type="datetime-local"
                                name="dataSorteio"
                                value={formData.dataSorteio}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
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
                                <option value="pendente">Pendente</option>
                                <option value="realizado">Realizado</option>
                                <option value="cancelado">Cancelado</option>
                            </select>
                        </div>
                        {formData.status === "realizado" && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Número Sorteado
                                </label>
                                <input
                                    type="number"
                                    name="numeroSorteado"
                                    value={formData.numeroSorteado}
                                    onChange={handleInputChange}
                                    min="1"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        )}
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
                            {editingSorteio ? "Atualizar" : "Criar"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Sorteios;
