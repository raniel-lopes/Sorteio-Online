import React, { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";

export default function Aniversariantes() {
    // Estado para datas
    const [dataInicio, setDataInicio] = useState(() => {
        const hoje = new Date();
        return hoje.toISOString().slice(0, 10);
    });
    const [dataFinal, setDataFinal] = useState(() => {
        const hoje = new Date();
        return hoje.toISOString().slice(0, 10);
    });

    // Função para definir as datas como hoje
    const handleHoje = () => {
        const hoje = new Date();
        const hojeStr = hoje.toISOString().slice(0, 10);
        setDataInicio(hojeStr);
        setDataFinal(hojeStr);
    };

    // Exemplo de dados (substitua pelos seus dados reais)
    const aniversariantesHoje = [
        {
            eleitor: "Helton Campos De Oliveira",
            tags: "",
            telefone: "(71) 98197-1087",
            data: "21/06",
            idade: 42,
            cidade: "SALVADOR"
        }
        // ...adicione mais aniversariantes conforme necessário
    ];

    const proximosAniversariantes = [
        {
            eleitor: "Exemplo Nome",
            tags: "",
            telefone: "71983021959",
            data: "22/06",
            idade: 30,
            cidade: "SALVADOR"
        }
        // ...adicione mais aniversariantes conforme necessário
    ];

    const etiquetas = [
        {
            nome: "Jessica Freitas Vaz",
            endereco: "Rua dos Franciscanos, DOM AVELAR, SALVADOR, BA, 41315-000"
        },
        {
            nome: "Jailton dos Santos",
            endereco: "Rua das Pitangueiras, 39,, CAJAZEIRAS, SALVADOR, BA,"
        },
        {
            nome: "Jailton dos Santos",
            endereco: "Rua das Pitangueiras, 39,, CAJAZEIRAS, SALVADOR, BA,"
        },
        {
            nome: "Jailton dos Santos",
            endereco: "Rua das Pitangueiras, 39,, CAJAZEIRAS, SALVADOR, BA,"
        },
        {
            nome: "Jailton dos Santos",
            endereco: "Rua das Pitangueiras, 39,, CAJAZEIRAS, SALVADOR, BA,"
        },
        {
            nome: "Anthony salomão Oliveira de Jesus",
            endereco: "Rua jota silvestre bloco 01\nApartamento 202, SALVADOR, BA,"
        }
    ];

    // Função para exportar Excel
    const exportarExcel = () => {
        // Junta os dados das duas tabelas
        const dados = [
            ...aniversariantesHoje.map(item => ({
                "Tipo": "Hoje",
                "Eleitor": item.eleitor,
                "Tags": item.tags,
                "Telefone": item.telefone,
                "Data de Aniversário": item.data,
                "Idade": item.idade,
                "Cidade": item.cidade
            })),
            ...proximosAniversariantes.map(item => ({
                "Tipo": "Próximos",
                "Eleitor": item.eleitor,
                "Tags": item.tags,
                "Telefone": item.telefone,
                "Data de Aniversário": item.data,
                "Idade": item.idade,
                "Cidade": item.cidade
            }))
        ];

        const worksheet = XLSX.utils.json_to_sheet(dados);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Aniversariantes");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(blob, "aniversariantes.xlsx");
    };

    // Função para gerar etiquetas em PDF
    const gerarEtiquetasPDF = () => {
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
        });

        const etiquetasPorLinha = 2;
        const etiquetasPorColuna = 3;
        const larguraEtiqueta = 100;
        const alturaEtiqueta = 50;
        const margemX = 10;
        const margemY = 15;
        const espacamentoX = 10;
        const espacamentoY = 10;

        etiquetas.forEach((etiqueta, idx) => {
            const col = idx % etiquetasPorLinha;
            const row = Math.floor(idx / etiquetasPorLinha) % etiquetasPorColuna;
            const page = Math.floor(idx / (etiquetasPorLinha * etiquetasPorColuna));
            if (idx > 0 && idx % (etiquetasPorLinha * etiquetasPorColuna) === 0) {
                doc.addPage();
            }
            const x = margemX + col * (larguraEtiqueta + espacamentoX);
            const y = margemY + row * (alturaEtiqueta + espacamentoY);

            // Caixa
            doc.setDrawColor(0);
            doc.setLineWidth(0.5);
            doc.roundedRect(x, y, larguraEtiqueta, alturaEtiqueta, 3, 3);

            // Nome (limita para 32 caracteres)
            const nomeExibido = etiqueta.nome.length > 32 ? etiqueta.nome.slice(0, 29) + "..." : etiqueta.nome;

            // Nome
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.text(`Nome:`, x + 4, y + 10);
            doc.setFont("helvetica", "normal");
            // Use recuo maior e largura menor
            doc.text(doc.splitTextToSize(nomeExibido, larguraEtiqueta - 65), x + 36, y + 10);

            // Endereço
            doc.setFont("helvetica", "bold");
            doc.text(`Endereço:`, x + 4, y + 18);
            doc.setFont("helvetica", "normal");
            const enderecoLines = doc.splitTextToSize(etiqueta.endereco, larguraEtiqueta - 65);
            doc.text(enderecoLines, x + 36, y + 18);
        });

        doc.save("etiquetas-aniversariantes.pdf");
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-700">Aniversários</h1>
                    <span className="text-gray-400 text-sm">Visão Geral &gt; Aniversários</span>
                </div>
                <div className="flex gap-2">
                    <button
                        className="bg-blue-600 text-white px-6 py-2 rounded font-semibold cursor-pointer"
                        onClick={handleHoje}
                    >
                        Hoje
                    </button>
                    <button
                        className="bg-blue-600 text-white px-6 py-2 rounded font-semibold cursor-pointer"
                        onClick={exportarExcel}
                    >
                        Excel
                    </button>
                    <button
                        className="bg-blue-600 text-white px-6 py-2 rounded font-semibold cursor-pointer"
                        onClick={gerarEtiquetasPDF}
                    >
                        PDF
                    </button>
                </div>
            </div>
            <div className="flex gap-4 mb-6 flex-wrap">
                <input
                    type="date"
                    className="border rounded px-4 py-2"
                    value={dataInicio}
                    onChange={e => setDataInicio(e.target.value)}
                />
                <input
                    type="date"
                    className="border rounded px-4 py-2"
                    value={dataFinal}
                    onChange={e => setDataFinal(e.target.value)}
                />
                <label className="flex items-center gap-2">
                    <input type="checkbox" />
                    Somente Líder?
                </label>
                <label className="flex items-center gap-2">
                    <input type="checkbox" />
                    Somente Autoridade?
                </label>
                <select className="border rounded px-4 py-2">
                    <option>Selecione</option>
                </select>
            </div>
            <div className="bg-white rounded shadow p-4 mb-6">
                <h3 className="text-xl font-semibold mb-4">Aniversariantes de hoje</h3>
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b">
                            <th></th>
                            <th className="py-2">ELEITOR</th>
                            <th className="py-2">TAGS</th>
                            <th className="py-2">TELEFONE</th>
                            <th className="py-2">DATA DE ANIVERSÁRIO</th>
                            <th className="py-2">IDADE</th>
                            <th className="py-2">CIDADE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {aniversariantesHoje.map((item, idx) => (
                            <tr key={idx}>
                                <td><input type="checkbox" /></td>
                                <td>{item.eleitor}</td>
                                <td>{item.tags}</td>
                                <td className="text-blue-600">{item.telefone} <span>🟢</span></td>
                                <td>{item.data}</td>
                                <td>{item.idade}</td>
                                <td>{item.cidade}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="bg-white rounded shadow p-4">
                <h3 className="text-xl font-semibold mb-4">Próximos aniversariantes</h3>
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b">
                            <th></th>
                            <th className="py-2">ELEITOR</th>
                            <th className="py-2">TAGS</th>
                            <th className="py-2">TELEFONE</th>
                            <th className="py-2">DATA DE ANIVERSÁRIO</th>
                            <th className="py-2">IDADE</th>
                            <th className="py-2">CIDADE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {proximosAniversariantes.map((item, idx) => (
                            <tr key={idx}>
                                <td><input type="checkbox" /></td>
                                <td>{item.eleitor}</td>
                                <td>{item.tags}</td>
                                <td className="text-blue-600">{item.telefone} <span>🟢</span></td>
                                <td>{item.data}</td>
                                <td>{item.idade}</td>
                                <td>{item.cidade}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}