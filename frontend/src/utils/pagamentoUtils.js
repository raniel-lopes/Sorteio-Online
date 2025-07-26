// Utilitário para buscar o pagamento pendente de um participante
import api from '../services/api';

export async function buscarPagamentoPendente(participanteId) {
    const response = await api.get('/validacao-pagamentos?status=pendente');
    // Filtra o pagamento do participante
    return (response.data || []).find(p => p.participanteId === Number(participanteId));
}
