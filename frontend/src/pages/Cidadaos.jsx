import React, { useState, useMemo, useEffect } from "react";
import RelatorioCidadaos from "@/components/RelatorioCidadaos";
import FiltrosCidadaos from "@/components/FiltrosCidadaos";
import ListaCidadaos from "@/components/ListaCidadaos";
import Modal from "@/components/Modal";
import CidadaoForm from "@/components/CidadaoForm";
import EleitorFormAndList from "@/components/EleitorFormAndList";

// Componente principal da página Cidadãos
export default function Cidadaos() {
    const [cidadaos, setCidadaos] = useState([]);
    const [filters, setFilters] = useState({
        tag: "",
        isLider: false,
        isAutoridade: false,
        minPotencial: "",
        cidade: "",
        bairro: "",
        rua: "",
        indicadoPor: "",
        origem: "",
        genero: "",
        cadastradoPor: "",
        ocupacao: "",
        minIdade: "",
        maxIdade: "",
        periodoInicio: "",
        periodoFim: "",
    });

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingCidadao, setEditingCidadao] = useState(null);

    // Mova para fora do useEffect:
    const fetchCidadaos = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/cidadaos", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            if (res.ok) {
                const data = await res.json();
                setCidadaos(data);
            }
        } catch (err) {
            console.error("Erro ao buscar cidadãos:", err);
        }
    };

    useEffect(() => {
        fetchCidadaos();
    }, []);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleClearFilters = () => {
        setFilters({
            tag: "",
            isLider: false,
            isAutoridade: false,
            minPotencial: "",
            cidade: "",
            bairro: "",
            rua: "",
            indicadoPor: "",
            origem: "",
            genero: "",
            cadastradoPor: "",
            ocupacao: "",
            minIdade: "",
            maxIdade: "",
            periodoInicio: "",
            periodoFim: "",
        });
    };

    const applyFilters = () => {
        // A lógica de filtragem é aplicada diretamente no useMemo filteredCidadaos
        console.log("Filtros aplicados:", filters);
    };

    const filteredCidadaos = useMemo(() => {
        return cidadaos.filter((cidadao) => {
            if (filters.tag && !cidadao.tags?.toLowerCase().includes(filters.tag.toLowerCase())) return false;
            if (filters.isLider && !cidadao.isLider) return false;
            if (filters.isAutoridade && !cidadao.isAutoridade) return false;
            if (filters.minPotencial !== "" && cidadao.votos < parseInt(filters.minPotencial)) return false;
            if (filters.cidade && cidadao.cidade?.toLowerCase() !== filters.cidade.toLowerCase()) return false;
            if (filters.bairro && cidadao.bairro?.toLowerCase() !== filters.bairro.toLowerCase()) return false;
            if (filters.rua && cidadao.rua && cidadao.rua.toLowerCase() !== filters.rua.toLowerCase()) return false;
            if (filters.indicadoPor && cidadao.indicadoPor && cidadao.indicadoPor.toLowerCase() !== filters.indicadoPor.toLowerCase()) return false;
            if (filters.origem && cidadao.origem && cidadao.origem.toLowerCase() !== filters.origem.toLowerCase()) return false;
            if (filters.genero && cidadao.genero && cidadao.genero.toLowerCase() !== filters.genero.toLowerCase()) return false;
            if (filters.ocupacao && cidadao.ocupacao && cidadao.ocupacao.toLowerCase() !== filters.ocupacao.toLowerCase()) return false;
            if (filters.minIdade !== "" && cidadao.idade < parseInt(filters.minIdade)) return false;
            if (filters.maxIdade !== "" && cidadao.idade > parseInt(filters.maxIdade)) return false;
            if (filters.periodoInicio && cidadao.dataCadastro < filters.periodoInicio) return false;
            if (filters.periodoFim && cidadao.dataCadastro > filters.periodoFim) return false;
            return true;
        });
    }, [cidadaos, filters]);

    // Adicionar cidadão (POST)
    const handleAddCidadao = async (newCidadaoData) => {
        try {
            const res = await fetch("http://localhost:5000/api/cidadaos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(newCidadaoData)
            });
            if (res.ok) {
                setShowAddModal(false);
                fetchCidadaos(); // <-- Atualiza a lista após adicionar
            }
        } catch (err) {
            console.error("Erro ao adicionar cidadão:", err);
        }
    };

    // Editar cidadão (PUT)
    const handleSaveEditedCidadao = async (updatedCidadaoData) => {
        try {
            const res = await fetch(`http://localhost:5000/api/cidadaos/${updatedCidadaoData.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(updatedCidadaoData)
            });
            if (res.ok) {
                setShowEditModal(false);
                setEditingCidadao(null);
                fetchCidadaos(); // <-- Atualiza a lista após editar
            }
        } catch (err) {
            console.error("Erro ao editar cidadão:", err);
        }
    };

    // Excluir cidadão (DELETE)
    const handleDeleteCidadao = async (idToDelete) => {
        if (window.confirm(`Tem certeza que deseja excluir o cidadão com ID ${idToDelete}?`)) {
            try {
                const res = await fetch(`http://localhost:5000/api/cidadaos/${idToDelete}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                });
                if (res.ok) {
                    fetchCidadaos(); // <-- Atualiza a lista após excluir
                }
            } catch (err) {
                console.error("Erro ao excluir cidadão:", err);
            }
        }
    };

    const handleEditCidadao = (cidadaoToEdit) => {
        setEditingCidadao(cidadaoToEdit);
        setShowEditModal(true);
    };

    const listaParaTela = filteredCidadaos.map(c => ({
        ...c,
        nome: c.nome || c.nomeCompleto || "",
        telefone: c.telefone || c.celular || c.telefoneFixo || "",
        bairro: c.bairro || "",
        cidade: c.cidade || "",
        tags: c.tags || "",
        votos: c.potencialVotos || c.votos || 0,
    }));

    return (
        <div className="p-6">
            <RelatorioCidadaos cidadaos={cidadaos} />
            <FiltrosCidadaos
                filters={filters}
                onFilterChange={handleFilterChange}
                onApplyFilters={applyFilters}
                onClearFilters={handleClearFilters}
            />
            <ListaCidadaos
                cidadaos={listaParaTela}
                onAddCidadao={() => setShowAddModal(true)}
                onEditCidadao={handleEditCidadao}
                onDeleteCidadao={handleDeleteCidadao}
                filters={filters}
                onFilterChange={handleFilterChange}
            />
            {/* Botão para adicionar cidadão */}
            <button
                className="fixed bottom-8 right-8 z-50 bg-yellow-600 hover:bg-yellow-700 text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center text-3xl transition"
                title="Adicionar Cidadão"
                onClick={() => setShowAddModal(true)}
            >
                <span className="sr-only">Adicionar Cidadão</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            </button>

            {/* Modal para Adicionar Cidadão */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Cadastro"
            >
                <EleitorFormAndList
                    setEleitores={setCidadaos}
                    eleitores={cidadaos}
                    onClose={() => setShowAddModal(false)}
                    onSave={handleAddCidadao}
                />
            </Modal>

            {/* Modal para Editar Cidadão */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Editar Cidadão"
            >
                {editingCidadao && (
                    <CidadaoForm
                        initialData={editingCidadao}
                        onSave={handleSaveEditedCidadao}
                        onClose={() => setShowEditModal(false)}
                    />
                )}
            </Modal>
        </div>
    );
}