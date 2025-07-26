import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FiCheck, FiClock, FiUpload, FiImage } from 'react-icons/fi';
import api from '../services/api';
import { buscarPagamentoPendente } from '../utils/pagamentoUtils';

const ConfirmarPagamento = () => {
    const { participanteId } = useParams();
    const [participante, setParticipante] = useState(null);
    const [pagamento, setPagamento] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comprovante, setComprovante] = useState(null);
    const [enviando, setEnviando] = useState(false);
    const [sucesso, setSucesso] = useState(false);

    useEffect(() => {
        carregarParticipanteEPagamento();
    }, [participanteId]);

    const carregarParticipanteEPagamento = async () => {
        try {
            const response = await api.get(`/participantes/${participanteId}`);
            setParticipante(response.data);
            // Buscar pagamento pendente
            const pagamentoPendente = await buscarPagamentoPendente(participanteId);
            setPagamento(pagamentoPendente);
        } catch (error) {
            console.error('Erro ao carregar participante ou pagamento:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setComprovante(file);
        }
    };

    const enviarComprovante = async () => {
        if (!comprovante) {
            alert('Por favor, selecione o comprovante de pagamento');
            return;
        }

        setEnviando(true);
        try {
            const formData = new FormData();
            formData.append('comprovante', comprovante);
            formData.append('participanteId', participanteId);

            await api.post('/validacao-pagamentos/comprovante', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setSucesso(true);
        } catch (error) {
            console.error('Erro ao enviar comprovante:', error);
            alert('Erro ao enviar comprovante. Tente novamente.');
        } finally {
            setEnviando(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (sucesso) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiCheck className="text-white" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Comprovante Enviado!</h2>
                    <p className="text-gray-600 mb-6">
                        Seu comprovante foi enviado com sucesso. O pagamento será verificado em até 24 horas.
                    </p>
                    <p className="text-sm text-gray-500">
                        Você receberá uma confirmação por Email assim que o pagamento for aprovado.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-md mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiClock className="text-white" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Confirmar Pagamento</h2>
                        <p className="text-gray-600 mt-2">
                            Envie o comprovante do seu pagamento PIX
                        </p>
                    </div>

                    {participante && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <h3 className="font-semibold text-gray-800 mb-2">Resumo da Compra</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Participante:</span>
                                    <span className="font-medium">{participante.nome}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Números:</span>
                                    <span className="font-medium">{pagamento?.dadosPagamento?.numerosReservados?.join(', ') || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Valor Total:</span>
                                    <span className="font-medium text-green-600">
                                        R$ {pagamento?.dadosPagamento?.valorTotal ? Number(pagamento.dadosPagamento.valorTotal).toFixed(2) : '-'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Comprovante de Pagamento *
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                                <div className="text-center">
                                    <FiImage className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="mt-4">
                                        <label className="cursor-pointer">
                                            <span className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                                                Selecionar Arquivo
                                            </span>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                            />
                                        </label>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-500">
                                        PNG, JPG até 5MB
                                    </p>
                                </div>
                            </div>
                            {comprovante && (
                                <p className="mt-2 text-sm text-green-600">
                                    ✓ Arquivo selecionado: {comprovante.name}
                                </p>
                            )}
                        </div>

                        <button
                            onClick={enviarComprovante}
                            disabled={!comprovante || enviando}
                            className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {enviando ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <FiUpload />
                                    Enviar Comprovante
                                </>
                            )}
                        </button>

                        <div className="text-center">
                            <p className="text-sm text-gray-500">
                                Após enviar o comprovante, seu pagamento será verificado em até 24 horas.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmarPagamento;
