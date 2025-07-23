import React, { useState, useEffect } from "react";
import api from "../services/api";
import { FiGift, FiUsers, FiTrendingUp, FiDollarSign, FiCalendar, FiAward, FiCreditCard } from "react-icons/fi";
import { Ticket } from "lucide-react";

// Componente auxiliar para os cartões de métricas
const DashboardMetricCard = ({ title, value, subtitle, icon, colorClass, textColorClass = 'text-white' }) => (
    <div className={`p-4 rounded-lg shadow-md flex flex-col justify-between ${colorClass}`}>
        <div className="flex items-center justify-between">
            <h3 className={`text-sm font-medium ${textColorClass}`}>{title}</h3>
            <div className={`text-2xl ${textColorClass}`}>{icon}</div>
        </div>
        <p className={`text-3xl font-bold mt-2 ${textColorClass}`}>{value}</p>
        {subtitle && <p className={`text-xs mt-1 ${textColorClass}`}>{subtitle}</p>}
    </div>
);

// Componente auxiliar para as tabelas
const DashboardTableCard = ({ title, headers, data, emptyMessage = "Nenhum dado disponível" }) => (
    <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        <div className="overflow-x-auto">
            {data.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {headers.map((header, index) => (
                                <th
                                    key={index}
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {Object.values(row).map((cell, cellIndex) => (
                                    <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="text-center text-gray-500 py-8">
                    {emptyMessage}
                </div>
            )}
        </div>
        {data.length > 5 && (
            <div className="text-center text-xs text-gray-500 mt-2">
                (Role para ver mais)
            </div>
        )}
    </div>
);

// Componente Rifas Ativas
const RifasAtivas = ({ rifas }) => (
    <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
        <h3 className="text-xl font-semibold mb-4">Rifas Ativas</h3>
        <div className="space-y-4">
            {rifas.length > 0 ? (
                rifas.slice(0, 3).map((rifa) => (
                    <div key={rifa.id} className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-semibold text-gray-900">{rifa.titulo}</h4>
                        <p className="text-sm text-gray-600">{rifa.premio}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                            <FiDollarSign className="mr-1" size={12} />
                            R$ {rifa.valorBilhete}
                            <span className="mx-2">•</span>
                            <Ticket className="mr-1" size={12} />
                            {rifa.quantidadeBilhetes} bilhetes
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center text-gray-500">
                    Nenhuma rifa ativa
                </div>
            )}
        </div>
    </div>
);

// Componente Próximos Sorteios
const ProximosSorteios = ({ sorteios }) => (
    <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
        <h3 className="text-xl font-semibold mb-4">Próximos Sorteios</h3>
        <div className="space-y-4">
            {sorteios.length > 0 ? (
                sorteios.slice(0, 3).map((sorteio) => (
                    <div key={sorteio.id} className="border-l-4 border-purple-500 pl-4">
                        <h4 className="font-semibold text-gray-900">{sorteio.Rifa?.titulo}</h4>
                        <p className="text-sm text-gray-600">{sorteio.Rifa?.premio}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                            <FiCalendar className="mr-1" size={12} />
                            {new Date(sorteio.dataSorteio).toLocaleDateString()}
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center text-gray-500">
                    Nenhum sorteio programado
                </div>
            )}
        </div>
    </div>
);

export default function DashboardPage() {
    // Verificação de autenticação
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/';
            return;
        }
    }, []);

    const [stats, setStats] = useState({
        totalRifas: 0,
        totalBilhetes: 0,
        totalParticipantes: 0,
        totalVendas: 0,
        bilhetesPendentes: 0,
        pagamentosPendentes: 0,
        sorteiosRealizados: 0,
        receitaTotal: 0
    });
    const [rifas, setRifas] = useState([]);
    const [sorteios, setSorteios] = useState([]);
    const [bilhetesRecentes, setBilhetesRecentes] = useState([]);
    const [pagamentosRecentes, setPagamentosRecentes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Buscar estatísticas
            const statsResponse = await api.get("/dashboard");
            setStats(statsResponse.data);

            // Buscar rifas ativas
            const rifasResponse = await api.get("/rifas");
            // Verificar se rifasResponse.data é um array, senão usar um array vazio
            const rifasData = Array.isArray(rifasResponse.data) ? rifasResponse.data :
                (rifasResponse.data.rifas ? rifasResponse.data.rifas : []);
            setRifas(rifasData.filter(rifa => rifa.status === 'ativa'));

            // Buscar próximos sorteios
            try {
                const sorteiosResponse = await api.get("/sorteios");
                const sorteiosData = Array.isArray(sorteiosResponse.data) ? sorteiosResponse.data : [];
                setSorteios(sorteiosData.filter(sorteio => sorteio.status === 'pendente'));
            } catch (sorteioError) {
                console.warn("Erro ao buscar sorteios:", sorteioError);
                setSorteios([]);
            }

            // Buscar bilhetes recentes
            try {
                const bilhetesResponse = await api.get("/bilhetes?limit=5");
                const bilhetesData = Array.isArray(bilhetesResponse.data) ? bilhetesResponse.data : [];
                setBilhetesRecentes(bilhetesData);
            } catch (bilheteError) {
                console.warn("Erro ao buscar bilhetes:", bilheteError);
                setBilhetesRecentes([]);
            }

            // Buscar pagamentos recentes
            try {
                const pagamentosResponse = await api.get("/pagamentos?limit=5");
                const pagamentosData = Array.isArray(pagamentosResponse.data) ? pagamentosResponse.data : [];
                setPagamentosRecentes(pagamentosData);
            } catch (pagamentoError) {
                console.warn("Erro ao buscar pagamentos:", pagamentoError);
                setPagamentosRecentes([]);
            }

            setLoading(false);
        } catch (error) {
            console.error("Erro ao carregar dados do dashboard:", error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Dados de exemplo para as métricas
    const metricsData = [
        { title: 'Total de Rifas', value: stats.estatisticasGerais?.totalRifas || 0, icon: <FiGift />, colorClass: 'bg-blue-500' },
        { title: 'Total de Bilhetes', value: stats.estatisticasFinanceiras?.bilhetesPagos || 0, icon: <Ticket />, colorClass: 'bg-green-500' },
        { title: 'Participantes', value: stats.estatisticasGerais?.totalParticipantes || 0, icon: <FiUsers />, colorClass: 'bg-purple-500' },
        { title: 'Receita Total', value: `R$ ${(stats.estatisticasFinanceiras?.valorTotalArrecadado || 0).toFixed(2)}`, icon: <FiDollarSign />, colorClass: 'bg-yellow-500' },
    ];

    const secondaryMetricsData = [
        { title: 'Bilhetes Disponíveis', value: stats.estatisticasFinanceiras?.bilhetesDisponiveis || 0, icon: <Ticket />, colorClass: 'bg-orange-500' },
        { title: 'Bilhetes Reservados', value: stats.estatisticasFinanceiras?.bilhetesReservados || 0, icon: <FiCreditCard />, colorClass: 'bg-red-500' },
        { title: 'Total de Sorteios', value: stats.estatisticasGerais?.totalSorteios || 0, icon: <FiAward />, colorClass: 'bg-indigo-500' },
    ];

    const bilhetesData = bilhetesRecentes.map(bilhete => ({
        numero: `#${bilhete.numero}`,
        participante: bilhete.Participante?.nome || 'N/A',
        rifa: bilhete.Rifa?.titulo || 'N/A',
        status: bilhete.status
    }));

    const pagamentosData = pagamentosRecentes.map(pagamento => ({
        bilhete: `#${pagamento.Bilhete?.numero}`,
        valor: `R$ ${pagamento.valor}`,
        metodo: pagamento.metodoPagamento,
        status: pagamento.status
    }));

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Dashboard - Sorteios Online</h1>
                <p className="text-gray-600">Visão geral das suas rifas e vendas</p>
            </div>

            {/* Primeira linha de métricas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {metricsData.map((metric, index) => (
                    <DashboardMetricCard
                        key={index}
                        title={metric.title}
                        value={metric.value}
                        icon={metric.icon}
                        colorClass={metric.colorClass}
                    />
                ))}
            </div>

            {/* Segunda linha de métricas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                {secondaryMetricsData.map((metric, index) => (
                    <DashboardMetricCard
                        key={index}
                        title={metric.title}
                        value={metric.value}
                        icon={metric.icon}
                        colorClass={metric.colorClass}
                    />
                ))}
            </div>

            {/* Seção principal com Rifas Ativas, Próximos Sorteios e Bilhetes Recentes */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Rifas Ativas */}
                <div className="lg:col-span-1">
                    <RifasAtivas rifas={rifas} />
                </div>
                {/* Próximos Sorteios */}
                <div className="lg:col-span-1">
                    <ProximosSorteios sorteios={sorteios} />
                </div>
                {/* Bilhetes Recentes */}
                <div className="lg:col-span-1">
                    <DashboardTableCard
                        title="Bilhetes Recentes"
                        headers={['NÚMERO', 'PARTICIPANTE', 'STATUS']}
                        data={bilhetesData.map(b => ({ numero: b.numero, participante: b.participante, status: b.status }))}
                    />
                </div>
            </div>

            {/* Última linha - Pagamentos Recentes */}
            <div className="grid grid-cols-1 gap-6">
                <DashboardTableCard
                    title="Pagamentos Recentes"
                    headers={['BILHETE', 'VALOR', 'MÉTODO', 'STATUS']}
                    data={pagamentosData}
                />
            </div>
        </div>
    );
}
