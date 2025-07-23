import React, { useState } from "react";

const variaveis = [
    { nome: "PRIMEIRO NOME", valor: "{primeiro_nome}" },
    { nome: "NOME COMPLETO", valor: "{nome_completo}" },
    { nome: "APELIDO", valor: "{apelido}" },
];

export default function WhatsappPage() {
    const [mensagem, setMensagem] = useState("");
    const [preview, setPreview] = useState("");
    const [imagem, setImagem] = useState(null);
    const [ativo, setAtivo] = useState(false);
    const [aba, setAba] = useState("aniversariante");

    React.useEffect(() => {
        setPreview(mensagem);
    }, [mensagem]);

    // Limpa os campos ao trocar para a aba "demandas"
    React.useEffect(() => {
        if (aba === "demandas") {
            setMensagem("");
            setPreview("");
            setImagem(null);
        }
    }, [aba]);

    return (
        <div className="flex h-full min-h-screen bg-gray-50">
            {/* Menu lateral */}
            <aside className="w-64 bg-white border-r p-0 flex flex-col h-screen">
                <nav className="flex-1 overflow-y-auto">
                    <ul>
                        <li className="mb-2">
                            <button
                                className={`w-full text-left font-semibold rounded p-2 shadow ${aba === "aniversariante"
                                    ? "bg-blue-600 text-white"
                                    : "hover:bg-gray-100"
                                    }`}
                                onClick={() => setAba("aniversariante")}
                            >
                                Mensagem Programada - Aniversariante
                            </button>
                        </li>
                        <li className="mb-2">
                            <button
                                className={`w-full text-left font-semibold rounded p-2 shadow ${aba === "demandas"
                                    ? "bg-blue-600 text-white"
                                    : "hover:bg-gray-100"
                                    }`}
                                onClick={() => setAba("demandas")}
                            >
                                Mensagem Programada - Demandas
                            </button>
                        </li>
                        <li className="mb-2">
                            <button
                                className={`w-full text-left font-semibold rounded p-2 shadow ${aba === "boasvindas"
                                    ? "bg-blue-600 text-white"
                                    : "hover:bg-gray-100"
                                    }`}
                                onClick={() => setAba("boasvindas")}
                            >
                                Mensagem Programada - Boas-Vindas
                            </button>
                        </li>
                        <li className="mt-6 mb-2">
                            <button
                                className={`w-full text-left font-semibold rounded p-2 shadow ${aba === "historico"
                                    ? "bg-blue-600 text-white"
                                    : "hover:bg-gray-100"
                                    }`}
                                onClick={() => setAba("historico")}
                            >
                                Histórico
                            </button>
                        </li>
                        <li>
                            <button
                                className={`w-full text-left font-semibold rounded p-2 shadow ${aba === "configuracao"
                                    ? "bg-blue-600 text-white"
                                    : "hover:bg-gray-100"
                                    }`}
                                onClick={() => setAba("configuracao")}
                            >
                                Configuração
                            </button>
                        </li>
                    </ul>
                </nav>
                {/* Barra inferior para preencher toda a coluna */}
                <div className="h-4 bg-gray-200 w-full" />
            </aside>

            {/* Conteúdo principal */}
            <main className="flex-1 p-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold flex items-center gap-2">
                        <span role="img" aria-label="msg">💬</span>
                        {aba === "aniversariante" && "Mensagem Programada - Aniversariante"}
                        {aba === "demandas" && "Mensagem Programada - Demandas"}
                        {aba === "boasvindas" && "Mensagem Programada - Boas-Vindas"}
                        {aba === "historico" && "Histórico"}
                        {aba === "configuracao" && "Configuração"}
                    </h2>
                    <div>
                        <label className="flex items-center cursor-pointer">
                            <span className="mr-2">Ativo</span>
                            <input
                                type="checkbox"
                                checked={ativo}
                                onChange={() => setAtivo(!ativo)}
                                className="toggle-checkbox"
                            />
                        </label>
                    </div>
                </div>

                {/* Só mostra variáveis e campos se não for histórico/configuração */}
                {!(aba === "historico" || aba === "configuracao") && (
                    <>
                        <div className="mb-4">
                            <span className="font-medium">Variáveis disponíveis para uso:</span>
                            <div className="flex gap-2 mt-2 flex-wrap">
                                {variaveis.map(v => (
                                    <span
                                        key={v.nome}
                                        className="bg-gray-700 text-white px-3 py-1 rounded font-semibold text-xs cursor-pointer"
                                        onClick={() => setMensagem(mensagem + " " + v.valor)}
                                    >
                                        {v.nome}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Só mostra upload de imagem se NÃO estiver na aba "demandas" */}
                        {(aba === "aniversariante" || aba === "boasvindas") && (
                            <>
                                <div className="flex items-center gap-2 mb-4">
                                    <label
                                        htmlFor="imagem-upload"
                                        className="cursor-pointer flex items-center gap-2 text-blue-600 hover:underline font-medium"
                                        style={{ minWidth: 0 }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 002.828 2.828l6.586-6.586M16 5v6h6" />
                                        </svg>
                                        <span>Escolher imagem para anexar</span>
                                        <input
                                            id="imagem-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={e => {
                                                if (e.target.files && e.target.files[0]) {
                                                    setImagem(e.target.files[0]);
                                                }
                                            }}
                                            className="hidden"
                                        />
                                    </label>
                                    <button
                                        className="bg-red-300 text-white px-4 py-2 rounded"
                                        onClick={() => setImagem(null)}
                                    >
                                        Remover Imagem
                                    </button>
                                </div>

                                {imagem && (
                                    <div className="mb-4">
                                        {/* <span className="block font-medium mb-1">Imagem selecionada:</span> */}
                                        <img
                                            src={URL.createObjectURL(imagem)}
                                            alt="Pré-visualização"
                                            className="max-h-40 rounded border mb-2"
                                        />
                                    </div>
                                )}
                            </>
                        )}

                        <div className="mb-4">
                            <label className="block font-medium mb-1">Mensagem</label>
                            <textarea
                                rows={4}
                                className="w-full border rounded p-2 bg-gray-100"
                                value={mensagem}
                                onChange={e => setMensagem(e.target.value)}
                                placeholder="Digite a mensagem..."
                            />
                        </div>

                        <div>
                            <label className="block font-medium mb-1">Pré-visualização</label>
                            <div className="w-full border rounded p-2 bg-gray-100 min-h-[120px] flex flex-col gap-2">
                                <span className="whitespace-pre-line">{preview}</span>
                                {/* Só mostra imagem na pré-visualização se NÃO for demandas */}
                                {(aba === "aniversariante" || aba === "boasvindas") && imagem && (
                                    <img
                                        src={URL.createObjectURL(imagem)}
                                        alt="Pré-visualização"
                                        className="rounded border mb-2 mt-2"
                                        style={{
                                            maxHeight: "300px",
                                            display: "block",
                                            margin: "13px auto 0 auto"
                                        }}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end mt-8">
                            <button
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded shadow"
                                onClick={() => {
                                    // Adicione aqui a lógica de enviar mensagem
                                    alert("Mensagem enviada!");
                                }}
                            >
                                Enviar Mensagem
                            </button>
                        </div>
                    </>
                )}

                {/* Conteúdo fictício para histórico/configuração */}
                {aba === "historico" && (
                    <div className="bg-white rounded-xl shadow p-8">
                        <h2 className="text-2xl font-semibold mb-8 text-gray-700">Filtrar Mensagens</h2>
                        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
                            <div className="flex gap-8 flex-wrap w-full">
                                <div className="flex flex-col flex-1 min-w-[220px]">
                                    <label className="mb-2 text-gray-500 font-medium">Status</label>
                                    <select
                                        className="border rounded px-4 py-3 bg-gray-50 text-gray-600"
                                        disabled
                                        defaultValue=""
                                    >
                                        <option value="">Selecionar Status</option>
                                    </select>
                                </div>
                                <div className="flex flex-col flex-1 min-w-[220px]">
                                    <label className="mb-2 text-gray-500 font-medium">Assuntos</label>
                                    <select
                                        className="border rounded px-4 py-3 bg-gray-50 text-gray-600"
                                        disabled
                                        defaultValue=""
                                    >
                                        <option value="">Selecione os Assuntos</option>
                                    </select>
                                </div>
                            </div>
                            <button
                                className="bg-red-500 hover:bg-red-600 text-white font-semibold px-8 py-3 rounded transition"
                                disabled
                            >
                                Cancelar todas as mensagens
                            </button>
                        </div>
                        <div className="flex justify-center items-center h-40">
                            <span className="text-gray-700 text-lg">Nenhum registro encontrado</span>
                        </div>
                    </div>
                )}
                {aba === "configuracao" && (
                    <div className="bg-gray-100 rounded p-6 text-gray-500">
                        <p>Configurações do disparo de WhatsApp aparecerão aqui.</p>
                    </div>
                )}
                {/* Espaço extra para rolagem confortável */}
                <div style={{ height: 80 }} />
            </main>
        </div>
    );
}