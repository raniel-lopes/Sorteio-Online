// components/MetricsCard.jsx
import React from 'react';

function MetricsCard() {
    return (
        <div className="bg-white shadow-lg rounded-lg p-5">
            <h3 className="text-xl font-semibold mb-4">Métricas</h3>
            <div className="flex justify-between items-center">
                <div>
                    <h4 className="text-lg">Atendimentos</h4>
                    <p className="text-xl font-bold text-blue-600">150</p>
                </div>
                <div>
                    <h4 className="text-lg">Projetos em Andamento</h4>
                    <p className="text-xl font-bold text-blue-600">8</p>
                </div>
            </div>
        </div>
    );
}

export default MetricsCard;
