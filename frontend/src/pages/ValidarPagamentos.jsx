import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiClock, FiEye, FiMessageCircle } from 'react-icons/fi';
import api from '../services/api';

function ValidarPagamentos() {
    const [pagamentos, setPagamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('pendente');

    useEffect(() => {
        carregarPagamentos();
    }, [filtro]);

    const carregarPagamentos = async () => {
        try {
            const response = await api.get(`/validacao-pagamentos?status=${filtro}`);
            setPagamentos(response.data);
        } catch (error) {
            console.error('Erro ao carregar pagamentos:', error);
        } finally {
            setLoading(false);
        }
    };

    const aprovarPagamento = async (pagamentoId) => {
        try {
            await api.put(`/validacao-pagamentos/${pagamentoId}/aprovar`);
            carregarPagamentos();
            alert('Pagamento aprovado! Notificação enviada por email para o cliente.');
        } catch (error) {
            console.error('Erro ao aprovar pagamento:', error);
            alert('Erro ao aprovar pagamento');
        }
    };

    const rejeitarPagamento = async (pagamentoId, motivo) => {
        try {
            await api.put(`/validacao-pagamentos/${pagamentoId}/rejeitar`, { motivo });
            carregarPagamentos();
            alert('Pagamento rejeitado! Notificação enviada por email para o cliente.');
        } catch (error) {
            console.error('Erro ao rejeitar pagamento:', error);
            alert('Erro ao rejeitar pagamento');
        }
    };

    const enviarMensagemWhatsApp = (pagamento) => {
        if (!pagamento.participante?.celular) {
            alert('Celular do participante não encontrado');
            return;
        }

        // Criar mensagem personalizada
        const celular = pagamento.participante.celular.replace(/\D/g, '');
        let celularFormatado = celular;

        if (celular.length === 11 && celular.startsWith('0')) {
            celularFormatado = celular.substring(1);
        }
        if (celular.length === 10) {
            celularFormatado = celular.substring(0, 2) + '9' + celular.substring(2);
        }
        if (!celularFormatado.startsWith('55')) {
            celularFormatado = '55' + celularFormatado;
        }

        const mensagem = `Olá ${pagamento.participante.nome}! 

Em relação à sua participação na rifa "${pagamento.dadosPagamento?.rifaTitulo}", gostaríamos de esclarecer algumas informações.

Em caso de dúvidas, estamos à disposição!`;

        const linkWhatsApp = `https://wa.me/${celularFormatado}?text=${encodeURIComponent(mensagem)}`;
        window.open(linkWhatsApp, '_blank');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pendente':
                return 'bg-yellow-100 text-yellow-800';
            case 'aprovado':
                return 'bg-green-100 text-green-800';
            case 'rejeitado':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
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
                <h1 className="text-2xl font-bold text-gray-800">Validar Pagamentos</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFiltro('pendente')}
                        className={`px-4 py-2 rounded-lg ${filtro === 'pendente' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                        Pendentes
                    </button>
                    <button
                        onClick={() => setFiltro('aprovado')}
                        className={`px-4 py-2 rounded-lg ${filtro === 'aprovado' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                        Aprovados
                    </button>
                    <button
                        onClick={() => setFiltro('rejeitado')}
                        className={`px-4 py-2 rounded-lg ${filtro === 'rejeitado' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                        Rejeitados
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md">
                {pagamentos.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <div className="mb-4">
                            <FiClock size={48} className="mx-auto text-gray-300" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">Nenhum pagamento encontrado</h3>
                        <p className="text-sm">
                            {filtro === 'pendente'
                                ? 'Não há pagamentos pendentes no momento.'
                                : `Não há pagamentos ${filtro}s.`
                            }
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Participante
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Rifa
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Valor
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Comprovante
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Data
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {pagamentos.map((pagamento) => (
                                    <tr key={pagamento.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {pagamento.participante?.nome || 'Nome não informado'}
                                                </div>
                                                <div className="text-sm text-gray-500 flex items-center gap-2">
                                                    📞 {pagamento.participante?.celular || 'Não informado'}
                                                    {pagamento.participante?.celular && (
                                                        <FiMessageCircle
                                                            className="text-green-500 cursor-pointer hover:text-green-700"
                                                            onClick={() => enviarMensagemWhatsApp(pagamento)}
                                                            title="Enviar mensagem WhatsApp"
                                                            size={14}
                                                        />
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    📧 {pagamento.participante?.email || 'Email não informado'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {pagamento.dadosPagamento?.rifaTitulo || 'Rifa não informada'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Qtd: {pagamento.dadosPagamento?.quantidadeBilhetes || 0} bilhetes
                                            </div>
                                            {pagamento.dadosPagamento?.numerosReservados && (
                                                <div className="text-xs text-gray-400">
                                                    Números: {pagamento.dadosPagamento.numerosReservados.slice(0, 5).join(', ')}
                                                    {pagamento.dadosPagamento.numerosReservados.length > 5 && '...'}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            R$ {Number(pagamento.valor || 0).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pagamento.status)}`}>
                                                {pagamento.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {pagamento.comprovanteUrl ? (
                                                <div className="flex items-center gap-2">
                                                    <FiEye
                                                        className="text-blue-500 cursor-pointer hover:text-blue-700"
                                                        onClick={() => window.open(`http://localhost:5000${pagamento.comprovanteUrl}`, '_blank')}
                                                        title="Ver comprovante"
                                                    />
                                                    <span className="text-green-600 text-xs">✓ Enviado</span>
                                                </div>
                                            ) : (
                                                <span className="text-orange-500 text-xs flex items-center gap-1">
                                                    <FiClock size={12} />
                                                    Aguardando
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(pagamento.createdAt).toLocaleDateString('pt-BR')}
                                            <div className="text-xs text-gray-400">
                                                {new Date(pagamento.createdAt).toLocaleTimeString('pt-BR')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {pagamento.status === 'pendente' && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => aprovarPagamento(pagamento.id)}
                                                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs flex items-center gap-1"
                                                        title="Aprovar pagamento"
                                                    >
                                                        <FiCheck size={14} />
                                                        Aprovar
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const motivo = prompt('Motivo da rejeição:');
                                                            if (motivo) {
                                                                rejeitarPagamento(pagamento.id, motivo);
                                                            }
                                                        }}
                                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs flex items-center gap-1"
                                                        title="Rejeitar pagamento"
                                                    >
                                                        <FiX size={14} />
                                                        Rejeitar
                                                    </button>
                                                </div>
                                            )}
                                            {pagamento.status === 'aprovado' && (
                                                <span className="text-green-600 text-xs font-medium">✓ Aprovado</span>
                                            )}
                                            {pagamento.status === 'rejeitado' && (
                                                <span className="text-red-600 text-xs font-medium">✗ Rejeitado</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Cards informativos */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-800 flex items-center gap-2">
                        � Notificações por Email
                    </h3>
                    <p className="text-sm text-blue-700 mt-1">
                        Ao aprovar/rejeitar, o cliente recebe automaticamente um email com todos os detalhes.
                    </p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-medium text-yellow-800 flex items-center gap-2">
                        💬 WhatsApp Manual
                    </h3>
                    <p className="text-sm text-yellow-700 mt-1">
                        Clique no ícone do WhatsApp para contato direto (apenas para esclarecimentos).
                    </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-medium text-green-800 flex items-center gap-2">
                        ✅ Validação por Celular
                    </h3>
                    <p className="text-sm text-green-700 mt-1">
                        Participantes são identificados apenas pelo celular. Mesmo celular pode fazer múltiplas compras.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ValidarPagamentos;
