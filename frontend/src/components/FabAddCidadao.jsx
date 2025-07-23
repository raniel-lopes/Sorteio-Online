import React, { useState } from "react";
import Modal from "@/components/Modal";
import EleitorFormAndList from "@/components/EleitorFormAndList";

export default function FabAddCidadao({ eleitores, setEleitores }) {
    const [showAddModal, setShowAddModal] = useState(false);

    return (
        <>
            <button
                className="fixed bottom-8 right-8 z-50 bg-yellow-600 hover:bg-yellow-700 text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center text-3xl transition"
                title="Adicionar Eleitor"
                onClick={() => setShowAddModal(true)}
            >
                <span className="sr-only">Adicionar Eleitor</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            </button>
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Cadastro de Cidadão"
            >
                <EleitorFormAndList
                    setEleitores={setEleitores}
                    eleitores={eleitores}
                    onClose={() => setShowAddModal(false)}
                />
            </Modal>
        </>
    );
}