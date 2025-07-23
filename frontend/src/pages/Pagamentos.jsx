import React, { useState, useEffect } from "react";
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiCreditCard, FiUser, FiDollarSign, FiCalendar, FiCheckCircle, FiXCircle } from "react-icons/fi";
import Modal from "../components/Modal";
import api from "../services/api";

const Pagamentos = () => {
    const [pagamentos, setPagamentos] = useState([]);
    const [filteredPagamentos, setFilteredPagamentos] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingPagamento, setEditingPagamento] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [bilhetes, setBilhetes] = useState([]);

    const [formData, setFormData] = useState({
        bilheteId: "",
        valor: "",
        metodoPagamento: "pix",
        status: "pendente",
        dataVencimento: "",
        observacoes: ""
    });

    useEffect(() => {
        fetchPagamentos();
        fetchBilhetes();
    }, []);

    useEffect(() => {
        const filtered = pagamentos.filter(
            pagamento =>
                pagamento.Bilhete?.Participante?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                pagamento.metodoPagamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
                pagamento.status.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredPagamentos(filtered);
    }, [searchTerm, pagamentos]);

    const fetchPagamentos = async () => {
        try {
            const response = await api.get("/pagamentos");
            setPagamentos(response.data.pagamentos || []);
            setFilteredPagamentos(response.data.pagamentos || []);
            setLoading(false);
        } catch (error) {
            setError("Erro ao carregar pagamentos");
            setLoading(false);
        }
    };

    const fetchBilhetes = async () => {
        try {
            const response = await api.get("/bilhetes");
            setBilhetes(response.data.bilhetes || response.data || []);
        } catch (error) {
            console.error("Erro ao carregar bilhetes:", error);
            setBilhetes([]); // Garantir que seja sempre um array
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
                bilheteId: parseInt(formData.bilheteId),
                valor: parseFloat(formData.valor)
            };

            if (editingPagamento) {
                await api.put(`/pagamentos/${editingPagamento.id}`, dataToSend);
            } else {
                await api.post("/pagamentos", dataToSend);
            }
            fetchPagamentos();
            setShowModal(false);
            resetForm();
        } catch (error) {
            setError("Erro ao salvar pagamento");
        }
    };

    const handleEdit = (pagamento) => {
        setEditingPagamento(pagamento);
        setFormData({
            bilheteId: pagamento.bilheteId.toString(),
            valor: pagamento.valor.toString(),
            metodoPagamento: pagamento.metodoPagamento,
            status: pagamento.status,
            dataVencimento: pagamento.dataVencimento,
            observacoes: pagamento.observacoes || ""
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Tem certeza que deseja excluir este pagamento?")) {
            try {
                await api.delete(`/pagamentos/${id}`);
                fetchPagamentos();
            } catch (error) {
                setError("Erro ao excluir pagamento");
            }
        }
    };

    const handleConfirmarPagamento = async (id) => {
        if (window.confirm("Tem certeza que deseja confirmar este pagamento?")) {
            try {
                await api.patch(`/pagamentos/${id}/confirmar`);
                fetchPagamentos();
            } catch (error) {
                setError("Erro ao confirmar pagamento");
            }
        }
    };

    const resetForm = () => {
        setFormData({
            bilheteId: "",
            valor: "",
            metodoPagamento: "pix",
            status: "pendente",
            dataVencimento: "",
            observacoes: ""
        });
        setEditingPagamento(null);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "confirmado":
                return "bg-green-100 text-green-800";
            case "pendente":
                return "bg-yellow-100 text-yellow-800";
            case "cancelado":
                return "bg-red-100 text-red-800";
            case "vencido":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getMetodoPagamentoIcon = (metodo) => {
        switch (metodo) {
            case "pix":
                return "📱";
            case "cartao":
                return "💳";
            case "dinheiro":
                return "💰";
            case "transferencia":
                return "🏦";
            default:
                return "💳";
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
                <h1 className="text-2xl font-bold text-gray-800">Pagamentos</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <FiPlus size={20} />
                    Novo Pagamento
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
                            placeholder="Pesquisar pagamentos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Bilhete
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Participante
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Valor
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Método
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Vencimento
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredPagamentos.map((pagamento) => (
                                <tr key={pagamento.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                                <FiCreditCard className="text-white" size={20} />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    Bilhete #{pagamento.Bilhete?.numero}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {pagamento.Bilhete?.Rifa?.titulo}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <FiUser className="mr-2 text-gray-400" size={16} />
                                            <div>
                                                <div className="text-sm text-gray-900">
                                                    {pagamento.Bilhete?.Participante?.nome}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {pagamento.Bilhete?.Participante?.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-900">
                                            <FiDollarSign className="mr-1" size={16} />
                                            R$ {pagamento.valor}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-900">
                                            <span className="mr-2">{getMetodoPagamentoIcon(pagamento.metodoPagamento)}</span>
                                            {pagamento.metodoPagamento}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pagamento.status)}`}>
                                            {pagamento.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-900">
                                            <FiCalendar className="mr-2" size={16} />
                                            {pagamento.dataVencimento ? new Date(pagamento.dataVencimento).toLocaleDateString() : "-"}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEdit(pagamento)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                <FiEdit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(pagamento.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <FiTrash2 size={16} />
                                            </button>
                                            {pagamento.status === "pendente" && (
                                                <button
                                                    onClick={() => handleConfirmarPagamento(pagamento.id)}
                                                    className="text-green-600 hover:text-green-900"
                                                    title="Confirmar pagamento"
                                                >
                                                    <FiCheckCircle size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal para criar/editar pagamento */}
            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    resetForm();
                }}
                title={editingPagamento ? "Editar Pagamento" : "Novo Pagamento"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Bilhete *
                            </label>
                            <select
                                name="bilheteId"
                                value={formData.bilheteId}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Selecione um bilhete</option>
                                {Array.isArray(bilhetes) && bilhetes.map((bilhete) => (
                                    <option key={bilhete.id} value={bilhete.id}>
                                        #{bilhete.numero} - {bilhete.Participante?.nome} - {bilhete.Rifa?.titulo}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Valor *
                            </label>
                            <input
                                type="number"
                                name="valor"
                                value={formData.valor}
                                onChange={handleInputChange}
                                required
                                step="0.01"
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Método de Pagamento *
                            </label>
                            <select
                                name="metodoPagamento"
                                value={formData.metodoPagamento}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="pix">PIX</option>
                                <option value="cartao">Cartão</option>
                                <option value="dinheiro">Dinheiro</option>
                                <option value="transferencia">Transferência</option>
                            </select>
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
                                <option value="confirmado">Confirmado</option>
                                <option value="cancelado">Cancelado</option>
                                <option value="vencido">Vencido</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Data de Vencimento
                            </label>
                            <input
                                type="date"
                                name="dataVencimento"
                                value={formData.dataVencimento}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Observações
                            </label>
                            <textarea
                                name="observacoes"
                                value={formData.observacoes}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
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
                            {editingPagamento ? "Atualizar" : "Criar"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Pagamentos;
