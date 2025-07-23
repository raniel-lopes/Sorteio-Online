import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiGift, FiUsers, FiDollarSign, FiCalendar, FiAward } from 'react-icons/fi';
import api from '../services/api';

const RifaDetalhes = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [rifa, setRifa] = useState(null);
    const [participantes, setParticipantes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [numeroSorteado, setNumeroSorteado] = useState('');
    const [vencedor, setVencedor] = useState(null);

    useEffect(() => {
        carregarRifa();
        carregarParticipantes();
    }, [id]);

    const carregarRifa = async () => {
        try {
            const response = await api.get(`/rifas/${id}`);
            setRifa(response.data);
        } catch (error) {
            console.error('Erro ao carregar rifa:', error);
        }
    };

    const carregarParticipantes = async () => {
        try {
            const response = await api.get(`/rifas/${id}/participantes`);
            setParticipantes(response.data || []);
            setLoading(false);
        } catch (error) {
            console.error('Erro ao carregar participantes:', error);
            setLoading(false);
        }
    };

    const buscarVencedor = () => {
        if (!numeroSorteado) {
            alert('Digite um número para buscar o vencedor');
            return;
        }

        const participante = participantes.find(p =>
            p.numerosReservados && p.numerosReservados.includes(parseInt(numeroSorteado))
        );

        if (participante) {
            setVencedor(participante);
        } else {
            setVencedor(null);
            alert('Nenhum participante encontrado com esse número');
        }
    };

    const realizarSorteio = async () => {
        if (!vencedor) {
            alert('Selecione um vencedor primeiro');
            return;
        }

        try {
            await api.put(`/rifas/${id}`, {
                ...rifa,
                status: 'finalizada',
                numeroVencedor: parseInt(numeroSorteado),
                vencedorId: vencedor.id
            });

            alert(`Sorteio realizado! Vencedor: ${vencedor.nome} - Número: ${numeroSorteado}`);
            carregarRifa();
        } catch (error) {
            console.error('Erro ao finalizar sorteio:', error);
            alert('Erro ao finalizar sorteio');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!rifa) {
        return (
            <div className="p-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Rifa não encontrada</h1>
                    <button onClick={() => navigate('/rifas')} className="text-blue-500 hover:underline">
                        Voltar para rifas
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate('/rifas')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                >
                    <FiArrowLeft size={20} />
                    Voltar
                </button>
                <h1 className="text-2xl font-bold text-gray-800">Detalhes da Rifa</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Informações da Rifa */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                            <FiGift className="text-white" size={24} />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900 mb-2">{rifa.titulo}</h2>
                            <p className="text-gray-600 mb-4">{rifa.descricao}</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <FiGift size={16} />
                                    <span>{rifa.premio}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <FiDollarSign size={16} />
                                    <span>R$ {rifa.valorBilhete}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <FiUsers size={16} />
                                    <span>{rifa.quantidadeBilhetes} bilhetes</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <FiCalendar size={16} />
                                    <span>{new Date(rifa.dataFim).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Lista de Participantes */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">
                            Participantes ({participantes.length})
                        </h3>
                        <div className="max-h-96 overflow-y-auto">
                            {participantes.length > 0 ? (
                                <div className="space-y-2">
                                    {participantes.map((participante) => (
                                        <div key={participante.id} className="border rounded-lg p-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-medium">{participante.nome}</h4>
                                                    <p className="text-sm text-gray-600">{participante.celular}</p>
                                                    {participante.email && (
                                                        <p className="text-sm text-gray-600">{participante.email}</p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium">
                                                        {participante.quantidadeCotas} cotas
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Números: {participante.numerosReservados?.join(', ') || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-8">
                                    Nenhum participante ainda
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Área do Sorteio */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <FiAward className="text-yellow-500" />
                        Área do Sorteio
                    </h3>

                    {rifa.status === 'finalizada' ? (
                        <div className="text-center py-6">
                            <FiAward className="mx-auto text-yellow-500 mb-4" size={48} />
                            <h4 className="text-xl font-bold text-green-600 mb-2">Sorteio Realizado!</h4>
                            <p className="text-gray-600 mb-2">Número vencedor: <strong>{rifa.numeroVencedor}</strong></p>
                            {rifa.vencedor && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                                    <h5 className="font-semibold text-green-800">Vencedor:</h5>
                                    <p className="text-green-700">{rifa.vencedor.nome}</p>
                                    <p className="text-green-600 text-sm">{rifa.vencedor.celular}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Número Sorteado
                                </label>
                                <input
                                    type="number"
                                    value={numeroSorteado}
                                    onChange={(e) => setNumeroSorteado(e.target.value)}
                                    placeholder="Digite o número sorteado"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="1"
                                    max={rifa.quantidadeBilhetes}
                                />
                            </div>

                            <button
                                onClick={buscarVencedor}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
                            >
                                Buscar Vencedor
                            </button>

                            {vencedor && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h5 className="font-semibold text-blue-800 mb-2">Vencedor Encontrado:</h5>
                                    <p className="text-blue-700 font-medium">{vencedor.nome}</p>
                                    <p className="text-blue-600 text-sm">{vencedor.celular}</p>
                                    {vencedor.email && (
                                        <p className="text-blue-600 text-sm">{vencedor.email}</p>
                                    )}

                                    <button
                                        onClick={realizarSorteio}
                                        className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md"
                                    >
                                        Confirmar Sorteio
                                    </button>
                                </div>
                            )}

                            {numeroSorteado && !vencedor && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-red-700 text-sm">
                                        Nenhum participante encontrado com o número {numeroSorteado}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RifaDetalhes;
