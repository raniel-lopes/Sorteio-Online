import React from 'react';

function CitizenList() {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-xl font-semibold text-gray-700">Lista de Cidadãos</h3>
            <ul className="mt-4">
                <li className="flex justify-between py-2">
                    <span>Pedro Oliveira</span>
                    <span className="text-gray-600">Eleitor</span>
                </li>
                <li className="flex justify-between py-2">
                    <span>Ana Costa</span>
                    <span className="text-gray-600">Eleitora</span>
                </li>
            </ul>
        </div>
    );
}

export default CitizenList;
