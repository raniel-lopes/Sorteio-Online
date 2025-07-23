import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { FiCopy, FiCheck, FiCreditCard, FiUpload } from 'react-icons/fi';

const PagamentoPix = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [rifa, setRifa] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copiado, setCopiado] = useState(false);

    // Dados do participante passados pela página anterior
    const { participante, quantidade, valorTotal, numerosReservados } = location.state || {};

    useEffect(() => {
        carregarRifa();
    }, [id]);

    const carregarRifa = async () => {
        try {
            const timestamp = Date.now(); // Evitar cache
            const response = await fetch(`http://localhost:5000/api/publico/publica/${id}?t=${timestamp}`);
            if (response.ok) {
                const data = await response.json();
                console.log('🔍 Dados da rifa carregados:', data); // Debug
                console.log('🔑 Chave PIX da rifa:', data.chavePix); // Debug
                setRifa(data);
            }
        } catch (error) {
            console.error('Erro ao carregar rifa:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Carregando informações de pagamento...</p>
                </div>
            </div>
        );
    }

    if (!rifa) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Rifa não encontrada</h1>
                    <p className="text-gray-600">A rifa que você está procurando não existe ou foi removida.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex justify-center">
            <div className="w-full max-w-2xl lg:max-w-5xl px-2 sm:px-4">
                {/* Cabeçalho com logo */}
                <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
                    <div className="flex justify-center">
                        <div className="w-full max-w-2xl lg:max-w-5xl px-2 sm:px-4 py-3">
                            <div className="flex items-center justify-center">
                                <div className="text-xl font-bold text-gray-800">
                                    🎯 Sorteio Online
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="pt-16">
                    <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                        {/* Informações da Reserva */}
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiCheck className="text-white" size={32} />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-800 mb-2">Reserva Confirmada!</h1>
                            <p className="text-gray-600">Complete o pagamento via PIX para garantir seus números</p>
                        </div>

                        {/* Detalhes da Compra */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <h2 className="text-lg font-semibold mb-3">Detalhes da Compra</h2>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Rifa:</span>
                                    <span className="font-medium">{rifa.titulo}</span>
                                </div>
                                {participante && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Participante:</span>
                                        <span className="font-medium">{participante.nome}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Quantidade de cotas:</span>
                                    <span className="font-medium">{quantidade || 1}</span>
                                </div>
                                {numerosReservados && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Números reservados:</span>
                                        <span className="font-medium">{numerosReservados.join(', ')}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-lg font-bold text-green-600 pt-2 border-t">
                                    <span>Total:</span>
                                    <span>R$ {valorTotal?.toFixed(2) || '10,00'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Pagamento PIX */}
                        <div className="border rounded-lg p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <FiCreditCard className="text-green-600" />
                                Pagamento via PIX
                            </h2>

                            {/* Chave PIX */}
                            {rifa?.chavePix ? (
                                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-blue-800 mb-2">Chave PIX para Pagamento:</h3>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={rifa.chavePix}
                                            readOnly
                                            className="flex-1 px-3 py-2 border border-blue-300 rounded-md bg-white text-sm font-mono"
                                        />
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(rifa.chavePix).then(() => {
                                                    setCopiado(true);
                                                    setTimeout(() => setCopiado(false), 3000);
                                                });
                                            }}
                                            className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${copiado
                                                ? 'bg-green-500 text-white'
                                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                                                }`}
                                        >
                                            {copiado ? <FiCheck size={16} /> : <FiCopy size={16} />}
                                            {copiado ? 'Copiado!' : 'Copiar'}
                                        </button>
                                    </div>
                                    <p className="text-sm text-blue-600 mt-2">
                                        💡 Use esta chave para fazer o PIX manual ou copie o código completo abaixo
                                    </p>
                                </div>
                            ) : (
                                <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Chave PIX não configurada</h3>
                                    <p className="text-sm text-yellow-700">
                                        A chave PIX não foi configurada para esta rifa. Use o código PIX completo abaixo.
                                    </p>
                                </div>
                            )}

                            {/* Instruções */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h3 className="font-semibold text-blue-800 mb-2">Instruções para Pagamento:</h3>
                                <ol className="text-sm text-blue-700 space-y-1">
                                    <li>1. Abra o app do seu banco</li>
                                    <li>2. Vá na opção PIX</li>
                                    <li>3. Escolha "Pagar com chave PIX" ou "Copia e Cola"</li>
                                    <li>4. Use a chave PIX acima ou cole o código PIX completo</li>
                                    <li>5. Confirme o pagamento de R$ {valorTotal?.toFixed(2) || '10,00'}</li>
                                </ol>
                            </div>

                            {/* Informações importantes */}
                            <div className="mt-4 text-sm text-gray-600">
                                <p className="mb-2">
                                    ⏱️ <strong>Importante:</strong> O pagamento deve ser realizado em até 24 horas para garantir seus números.
                                </p>
                                <p>
                                    📱 Após o pagamento, você receberá a confirmação no WhatsApp cadastrado.
                                </p>
                            </div>
                        </div>

                        {/* Botões de ação */}
                        <div className="mt-6 space-y-3">
                            <button
                                onClick={() => {
                                    if (participante?.id) {
                                        navigate(`/confirmar-pagamento/${participante.id}`);
                                    } else {
                                        alert('Informações do participante não encontradas');
                                    }
                                }}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                            >
                                <FiUpload size={20} />
                                Enviar Comprovante
                            </button>

                            <button
                                onClick={() => {
                                    const whatsapp = '5511999999999'; // Número do WhatsApp da empresa
                                    const mensagem = `Olá! Acabei de fazer uma reserva na rifa "${rifa.titulo}" e gostaria de confirmar o pagamento. Números reservados: ${numerosReservados?.join(', ') || 'N/A'}`;
                                    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(mensagem)}`, '_blank');
                                }}
                                className="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold"
                            >
                                Falar no WhatsApp
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default PagamentoPix;
