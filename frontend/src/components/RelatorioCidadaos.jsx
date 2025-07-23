import React, { useState, useMemo } from "react";
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";

const COLORS_PIE = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA00FF', '#FF00AA', '#1ABC9C', '#2ECC71', '#3498DB', '#9B59B6', '#E74C3C', '#F1C40F'];
const COLORS_BAR = ['#8884d8', '#82ca9d', '#ffc658', '#FF8042', '#0088FE', '#00C49F', '#2ECC71', '#3498DB', '#9B59B6', '#E74C3C', '#F1C40F', '#1ABC9C'];

const processDataForPieChart = (data, key) => {
    const counts = data.reduce((acc, item) => {
        const value = item[key] || 'Não definido';
        acc[value] = (acc[value] || 0) + 1;
        return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
};

const processTagsData = (data) => {
    const tagCounts = data.reduce((acc, item) => {
        if (item.tags) {
            const tagsArray = item.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            tagsArray.forEach(tag => {
                acc[tag] = (acc[tag] || 0) + 1;
            });
        }
        return acc;
    }, {});
    return Object.entries(tagCounts).map(([name, value]) => ({ name, value }));
};

const processAgeData = (data) => {
    const ageRanges = {
        'Menor de 18': 0,
        '18-25': 0,
        '26-35': 0,
        '36-45': 0,
        '46-55': 0,
        '56-65': 0,
        'Maior de 65': 0,
        'Não definido': 0,
    };
    data.forEach(item => {
        const age = item.idade;
        if (age === undefined || age === null || age === 0) {
            ageRanges['Não definido']++;
        } else if (age < 18) {
            ageRanges['Menor de 18']++;
        } else if (age >= 18 && age <= 25) {
            ageRanges['18-25']++;
        } else if (age >= 26 && age <= 35) {
            ageRanges['26-35']++;
        } else if (age >= 36 && age <= 45) {
            ageRanges['36-45']++;
        } else if (age >= 46 && age <= 55) {
            ageRanges['46-55']++;
        } else if (age >= 56 && age <= 65) {
            ageRanges['56-65']++;
        } else {
            ageRanges['Maior de 65']++;
        }
    });
    return Object.entries(ageRanges).map(([name, value]) => ({ name, value }));
};

const ChartCard = ({ title, children }) => (
    <div
        className="bg-white p-10 rounded-lg shadow-md flex flex-col items-center justify-center"
        style={{
            minHeight: 500,
            width: "100%",
            maxWidth: "100%",
        }}
    >
        <h3 className="text-lg font-semibold mb-4 text-center text-gray-800">{title}</h3>
        <div style={{ width: 520, height: 520, maxWidth: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
                {children}
            </ResponsiveContainer>
        </div>
    </div>
);

// Função para posicionar a porcentagem dentro da fatia do donut
const renderPercentLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
}) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Só mostra se for maior que 3%
    return percent > 0.03 ? (
        <text
            x={x}
            y={y}
            fill="#fff"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={14}
            fontWeight={700}
        >
            {(percent * 100).toFixed(0)}%
        </text>
    ) : null;
};

export default function RelatorioCidadaos({ cidadaos }) {
    const [localidadeType, setLocalidadeType] = useState('cidade');
    const [cidadeSelecionada, setCidadeSelecionada] = useState('');
    const dadosCidade = useMemo(() => processDataForPieChart(cidadaos, 'cidade'), [cidadaos]);
    const dadosBairro = useMemo(() => {
        const result = processDataForPieChart(cidadaos, 'bairro');
        console.log("dadosBairro", result);
        return result;
    }, [cidadaos]);
    const dadosGenero = useMemo(() => processDataForPieChart(cidadaos, 'genero'), [cidadaos]);
    const dadosTags = useMemo(() => processTagsData(cidadaos), [cidadaos]);
    const dadosIdade = useMemo(() => processAgeData(cidadaos), [cidadaos]);
    const cidadaosFiltrados = useMemo(() => {
        if (localidadeType === 'bairro' && cidadeSelecionada) {
            return cidadaos.filter(c => c.cidade === cidadeSelecionada);
        }
        return cidadaos;
    }, [cidadaos, localidadeType, cidadeSelecionada]);

    const dadosBairroFiltrado = useMemo(
        () => processDataForPieChart(cidadaosFiltrados, 'bairro'),
        [cidadaosFiltrados]
    );

    const dadosLocalidadeAtivos =
        localidadeType === 'cidade' ? dadosCidade : dadosBairroFiltrado;

    return (
        <div className="mb-10">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Relatório Geral de Cidadãos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full px-4">
                <ChartCard title={localidadeType === 'cidade' ? 'Cidadãos por Cidade' : 'Cidadãos por Bairro'}>
                    <div>
                        <div className="flex justify-center mb-4">
                            <button
                                onClick={() => setLocalidadeType('cidade')}
                                className={`px-4 py-2 text-sm font-medium rounded-l-full transition-colors duration-200 ease-in-out
                  ${localidadeType === 'cidade' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-blue-100'}`}
                            >
                                Cidades
                            </button>
                            <button
                                onClick={() => setLocalidadeType('bairro')}
                                className={`px-4 py-2 text-sm font-medium rounded-r-full transition-colors duration-200 ease-in-out
                  ${localidadeType === 'bairro' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-blue-100'}`}
                            >
                                Bairros
                            </button>
                        </div>
                        {localidadeType === 'bairro' && (
                            <div className="mb-4 flex justify-center">
                                <select
                                    value={cidadeSelecionada}
                                    onChange={e => setCidadeSelecionada(e.target.value)}
                                    className="border rounded px-3 py-1"
                                >
                                    <option value="">Todas as cidades</option>
                                    {dadosCidade.map(c => (
                                        <option key={c.name} value={c.name}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div style={{ width: 420, height: 375, maxWidth: "100%", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={dadosLocalidadeAtivos}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={120}
                                        innerRadius={60}
                                        fill="#8884d8"
                                        label={renderPercentLabel}
                                        labelLine={false}
                                    >
                                        {dadosLocalidadeAtivos.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </ChartCard>
                <ChartCard title="Cidadãos por Gênero">
                    <div style={{ width: 420, height: 375, maxWidth: "100%", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={dadosGenero}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={120}
                                    innerRadius={60}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                >
                                    {dadosGenero.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>
                <ChartCard title="Distribuição por Idade">
                    <div style={{ width: 420, height: 375, maxWidth: "100%", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dadosIdade} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" angle={-30} textAnchor="end" interval={0} style={{ fontSize: '10px' }} />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="value" name="Cidadãos" radius={[10, 10, 0, 0]}>
                                    {dadosIdade.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS_BAR[index % COLORS_BAR.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>
                <ChartCard title="Cidadãos por Tags">
                    <div style={{ width: 420, height: 375, maxWidth: "100%", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={dadosTags}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={120}
                                    innerRadius={60}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                >
                                    {dadosTags.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>
            </div>
        </div>
    );
}