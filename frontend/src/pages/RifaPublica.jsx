import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiShare2, FiGift, FiCalendar, FiUsers, FiCreditCard } from 'react-icons/fi';

const RifaPublica = () => {
    const { slug, id } = useParams(); // Capturar tanto slug quanto id
    const navigate = useNavigate();
    const [rifa, setRifa] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantidade, setQuantidade] = useState(1);
    const [valorTotal, setValorTotal] = useState(0);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [mostrarVerificacao, setMostrarVerificacao] = useState(false);
    const [celularVerificacao, setCelularVerificacao] = useState('');
    const [resultadoVerificacao, setResultadoVerificacao] = useState(null);
    const [loadingVerificacao, setLoadingVerificacao] = useState(false);
    const [participante, setParticipante] = useState({
        nome: '',
        celular: '',
        email: ''
    });

    // Determinar qual parâmetro está sendo usado
    const parametro = slug || id;
    const isSlug = !!slug; // true se for slug, false se for id

    useEffect(() => {
        carregarRifa();
    }, [parametro]);

    useEffect(() => {
        if (rifa && rifa.valorBilhete) {
            const valorBilhete = parseFloat(rifa.valorBilhete) || 0;
            const total = quantidade * valorBilhete;
            setValorTotal(total);
        }
    }, [quantidade, rifa]);

    const carregarRifa = async () => {
        try {
            if (!parametro) {
                throw new Error('Parâmetro da rifa não encontrado');
            }

            // Detectar se é slug (contém letras/hífens) ou ID (apenas números)
            const isNumeric = /^\d+$/.test(parametro);
            const isSlugParam = !isNumeric;

            let url;
            if (isSlugParam) {
                url = `https://sorteio-online-production.up.railway.app/api/publico/publica/slug/${parametro}`;
                console.log('🔍 Carregando rifa por SLUG:', parametro);
            } else {
                url = `https://sorteio-online-production.up.railway.app/api/publico/publica/${parametro}`;
                console.log('🔍 Carregando rifa por ID:', parametro);
            }

            console.log('🔍 URL da requisição:', url);

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Rifa carregada:', data);
                setRifa(data);
            } else {
                console.error('❌ Erro na resposta:', response.status, response.statusText);
                const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
                console.error('❌ Detalhes do erro:', errorData);
            }
        } catch (error) {
            console.error('❌ Erro ao carregar rifa:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleQuantidadeChange = (novaQuantidade) => {
        if (novaQuantidade >= 1 && novaQuantidade <= (rifa?.quantidadeBilhetes || 100)) {
            setQuantidade(novaQuantidade);
        }
    };

    const incrementos = [1, 5, 10, 100, 1000, 5000, 10000, 20000];

    const handleReservar = () => {
        if (quantidade > 0) {
            setMostrarFormulario(true);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Gerar números aleatórios para o participante
            const numerosDisponiveis = [];
            for (let i = 1; i <= rifa.quantidadeBilhetes; i++) {
                numerosDisponiveis.push(i);
            }

            // Embaralhar e pegar a quantidade solicitada
            const numerosReservados = [];
            for (let i = 0; i < quantidade; i++) {
                const indiceAleatorio = Math.floor(Math.random() * numerosDisponiveis.length);
                numerosReservados.push(numerosDisponiveis.splice(indiceAleatorio, 1)[0]);
            }
            numerosReservados.sort((a, b) => a - b);

            // Criar participante
            const participanteResponse = await fetch('https://sorteio-online-production.up.railway.app/api/publico/participantes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nome: participante.nome,
                    celular: participante.celular,
                    email: participante.email,
                    rifaId: rifa.id, // Usar rifa.id que funcionará tanto para slug quanto ID
                    quantidadeCotas: quantidade,
                    numerosReservados: numerosReservados,
                    valorTotal: valorTotal,
                    status: 'reservado'
                })
            });

            if (participanteResponse.ok) {
                const participanteData = await participanteResponse.json();

                // Redirecionar para página de pagamento com os dados
                navigate(`/pagamento/${rifa.id}`, {
                    state: {
                        participante: participanteData,
                        quantidade: quantidade,
                        valorTotal: valorTotal,
                        numerosReservados: numerosReservados
                    }
                });
            } else {
                throw new Error('Erro ao criar participante');
            }
        } catch (error) {
            console.error('Erro ao processar reserva:', error);
            alert('Erro ao processar reserva. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const verificarNumeros = async () => {
        if (!celularVerificacao.trim()) {
            alert('Por favor, insira seu número de celular');
            return;
        }

        setLoadingVerificacao(true);
        try {
            const response = await fetch(`https://sorteio-online-production.up.railway.app/api/publico/publica/${rifa.id}/verificar-numeros`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    celular: celularVerificacao
                })
            });

            if (response.ok) {
                const resultado = await response.json();
                setResultadoVerificacao(resultado);
            } else {
                const errorData = await response.json();
                setResultadoVerificacao(null);
                alert(errorData.message || 'Nenhum número encontrado para este celular');
            }
        } catch (error) {
            console.error('Erro ao verificar números:', error);
            alert('Erro ao verificar números. Tente novamente.');
        } finally {
            setLoadingVerificacao(false);
        }
    };

    const compartilhar = () => {
        const url = window.location.href;
        if (navigator.share) {
            navigator.share({
                title: rifa.titulo,
                text: `Participe da rifa: ${rifa.titulo}`,
                url: url
            });
        } else {
            navigator.clipboard.writeText(url);
            alert('Link copiado para a área de transferência!');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Carregando rifa...</p>
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

    const porcentagemVendida = (rifa.bilhetesVendidos / rifa.quantidadeBilhetes) * 100;

    return (
        <div className="min-h-screen bg-gray-50 flex justify-center">
            <div className="w-full max-w-2xl lg:max-w-5xl px-2 sm:px-4">
                {/* Cabeçalho com logo */}
                <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
                    <div className="flex justify-center">
                        <div className="w-full max-w-2xl lg:max-w-5xl px-2 sm:px-4 py-3">
                            <div className="flex items-center justify-center">
                                <img
                                    src="/images/Sorteio-online.png"
                                    alt="Logo Sorteio Online"
                                    className="h-10 w-auto"
                                />
                            </div>
                        </div>
                    </div>
                </header>

                <main className="pt-16">
                    {/* Container centralizado */}
                    <div className="bg-white overflow-hidden shadow-sm">
                        {/* Seção de imagem com preço sobreposto */}
                        <section className="relative">
                            <div className="aspect-video w-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center rounded-lg">
                                {rifa.imagemUrl ? (
                                    <img
                                        src={`https://sorteio-online-production.up.railway.app${rifa.imagemUrl}`}
                                        alt={rifa.titulo}
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                ) : (
                                    <div className="text-center text-white">
                                        <FiGift size={80} className="mx-auto mb-3" />
                                        <p className="text-lg">Imagem do prêmio</p>
                                    </div>
                                )}
                            </div>

                            {/* Preço sobreposto */}
                            <div className="absolute w-full px-2 sm:px-6">
                                <div className="flex w-full -translate-y-2/3 items-center justify-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm shadow-lg sm:max-w-max sm:-translate-y-[160%]">
                                    <div>Participe por apenas</div>
                                    <span className="text-base font-semibold">R$ {parseFloat(rifa.valorBilhete || 0).toFixed(2)}</span>
                                    <span>🔥</span>
                                </div>
                            </div>
                        </section>

                        {/* Conteúdo principal */}
                        <div className="mt-6 space-y-4 px-2 sm:px-4 sm:mt-8 sm:space-y-6 lg:px-8">
                            {/* Título da rifa */}
                            <section>
                                <h1 className="text-2xl font-bold">{rifa.titulo}</h1>
                                <hr className="my-4" />

                                {/* Organizador */}
                                <div className="flex items-start gap-3">
                                    <div className="h-16 w-16 bg-blue-500 rounded-full flex items-center justify-center border border-gray-100">
                                        <span className="text-white font-bold text-xl">S</span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="flex flex-col">
                                                <small className="text-xs">Organizado por:</small>
                                                <span className="font-medium">Sorteio Online</span>
                                            </div>
                                        </div>
                                        <div className="mt-1 flex items-center gap-2 text-xs">
                                            <span className="flex items-center gap-1 rounded-full bg-green-500 px-2 py-1 text-white">
                                                <span>Suporte</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </section>
                            {/* Seleção de quantidade de cotas */}
                            <section className="relative">
                                <div className="bg-white px-2 sm:px-4 py-6 sm:px-6">
                                    <h2 className="text-center text-xs font-semibold uppercase tracking-wider text-gray-500 sm:text-sm">
                                        Selecione a quantidade de cotas
                                    </h2>

                                    {/* Barra de progresso */}
                                    <div className="my-6">
                                        <div className="relative h-3 overflow-hidden rounded-lg border bg-gray-50">
                                            <div
                                                className="absolute h-full rounded-r-lg transition-all duration-300 bg-green-500"
                                                style={{ right: `calc(${100 - porcentagemVendida}%)`, zIndex: 1 }}
                                            ></div>
                                        </div>
                                        <p className="mt-1 text-sm">{porcentagemVendida.toFixed(3)}%</p>
                                    </div>

                                    {!mostrarFormulario ? (
                                        <div className="space-y-6">
                                            {/* Botões de incremento */}
                                            <div className="mx-auto mt-4 grid max-w-xl grid-cols-4 gap-2">
                                                {incrementos.map((inc) => (
                                                    <button
                                                        key={inc}
                                                        type="button"
                                                        onClick={() => handleQuantidadeChange(quantidade + inc)}
                                                        className="rounded-lg border py-2 text-center text-sm font-semibold hover:bg-gray-100 transition-colors"
                                                    >
                                                        +{inc}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Controle de quantidade */}
                                            <div className="mx-auto mt-4 flex max-w-xl items-center gap-4">
                                                <button
                                                    type="button"
                                                    onClick={() => handleQuantidadeChange(quantidade - 1)}
                                                    className="h-10 w-10 rounded-full border p-1 hover:bg-gray-100 transition-colors"
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="number"
                                                    value={quantidade}
                                                    onChange={(e) => handleQuantidadeChange(parseInt(e.target.value) || 1)}
                                                    className="text-center border rounded-lg py-2 px-4 w-20"
                                                    min="1"
                                                    max={rifa?.quantidadeBilhetes || 100}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleQuantidadeChange(quantidade + 1)}
                                                    className="h-10 w-10 rounded-full border p-1 hover:bg-gray-100 transition-colors"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            {/* Valor total */}
                                            <div className="mx-auto mt-6 max-w-xl text-sm">
                                                <div className="flex justify-between">
                                                    <span>Valor final</span>
                                                    <span>R$ {valorTotal.toFixed(2)}</span>
                                                </div>
                                            </div>

                                            {/* Botão reservar */}
                                            <div className="mx-auto max-w-xl space-y-3">
                                                <button
                                                    type="button"
                                                    onClick={handleReservar}
                                                    className="mt-6 w-full bg-green-600 text-white hover:bg-green-600/90 h-10 px-4 py-2 rounded-md font-semibold transition-colors"
                                                >
                                                    RESERVAR
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setMostrarVerificacao(true)}
                                                    className="w-full bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2 rounded-md font-semibold transition-colors"
                                                >
                                                    MEUS NÚMEROS
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <form onSubmit={handleSubmit} className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Nome Completo *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={participante.nome}
                                                        onChange={(e) => setParticipante({ ...participante, nome: e.target.value })}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Celular *
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        required
                                                        value={participante.celular}
                                                        onChange={(e) => setParticipante({ ...participante, celular: e.target.value })}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Email
                                                    </label>
                                                    <input
                                                        type="email"
                                                        value={participante.email}
                                                        onChange={(e) => setParticipante({ ...participante, email: e.target.value })}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                    />
                                                </div>

                                                <div className="border-t pt-4">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <span className="text-sm text-gray-600">Quantidade:</span>
                                                        <span className="font-medium">{quantidade} cotas</span>
                                                    </div>
                                                    <div className="flex justify-between items-center mb-4">
                                                        <span className="text-sm text-gray-600">Valor total:</span>
                                                        <span className="text-lg font-bold text-green-600">R$ {valorTotal.toFixed(2)}</span>
                                                    </div>
                                                </div>

                                                <div className="flex gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => setMostrarFormulario(false)}
                                                        className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                                                    >
                                                        Voltar
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                                                    >
                                                        Finalizar Compra
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Seção de compartilhamento */}
                            <section className="mx-auto bg-white px-2 sm:px-4 pb-4 pt-3 sm:py-6">
                                <div className="mx-auto max-w-sm">
                                    <h2 className="border-b pb-2 text-sm font-semibold">Compartilhar</h2>
                                    <div className="mt-3 flex gap-3">
                                        <button
                                            onClick={compartilhar}
                                            className="bg-blue-600 max-w-max rounded-md p-2 hover:bg-opacity-50"
                                        >
                                            <FiShare2 size={20} className="text-white" />
                                        </button>
                                        <button
                                            onClick={compartilhar}
                                            className="bg-blue-400 max-w-max rounded-md p-2 hover:bg-opacity-50"
                                        >
                                            <FiShare2 size={20} className="text-white" />
                                        </button>
                                        <button
                                            onClick={compartilhar}
                                            className="bg-green-500 max-w-max rounded-md p-2 hover:bg-opacity-50"
                                        >
                                            <FiShare2 size={20} className="text-white" />
                                        </button>
                                        <button
                                            onClick={compartilhar}
                                            className="bg-black max-w-max rounded-md p-2 hover:bg-opacity-50"
                                        >
                                            <FiShare2 size={20} className="text-white" />
                                        </button>
                                    </div>
                                </div>
                            </section>

                            {/* Seção de informações sobre pagamento e sorteio */}
                            <section className="grid grid-cols-2 gap-4 sm:gap-6">
                                <div className="bg-white p-4 sm:p-6">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 sm:text-sm">
                                        Método de Pagamento
                                    </p>
                                    <p className="mt-4 flex items-center gap-3 text-xs font-medium sm:text-sm">
                                        <FiCreditCard className="h-6 w-6 text-green-600" />
                                        <span>PIX</span>
                                    </p>
                                </div>
                                <div className="bg-white p-4 sm:p-6">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 sm:text-sm">
                                        Sorteio
                                    </p>
                                    <p className="mt-4 flex items-center gap-3 text-xs font-medium sm:text-sm">
                                        <span className="h-6 w-6 text-center text-base">🍀</span>
                                        <span className="break-all uppercase">Sorteador.com.br</span>
                                    </p>
                                </div>
                            </section>
                        </div>

                        {/* Footer */}
                        <footer className="bg-black/90 py-1.5 px-1 text-center">
                            <div className="mt-2 flex justify-center items-center">
                                <p className="text-white text-xs">Desenvolvido por Raniel Lopes</p>
                            </div>

                        </footer>
                    </div>

                    {/* Modal de Loading */}
                    {loading && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white p-6 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                                    <span>Processando sua compra...</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Modal de Verificação de Números */}
                    {mostrarVerificacao && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xl font-bold text-gray-800">Meus Números</h3>
                                        <button
                                            onClick={() => {
                                                setMostrarVerificacao(false);
                                                setCelularVerificacao('');
                                                setResultadoVerificacao(null);
                                            }}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    {!resultadoVerificacao ? (
                                        <div className="space-y-4">
                                            <p className="text-gray-600">
                                                Digite seu número de celular para verificar seus números nesta rifa:
                                            </p>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Celular
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={celularVerificacao}
                                                    onChange={(e) => setCelularVerificacao(e.target.value)}
                                                    placeholder="(11) 99999-9999"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <button
                                                onClick={verificarNumeros}
                                                disabled={loadingVerificacao}
                                                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                                            >
                                                {loadingVerificacao ? 'Verificando...' : 'Verificar Números'}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                <h4 className="font-semibold text-green-800 mb-2">
                                                    {resultadoVerificacao.participante.nome}
                                                </h4>
                                                <p className="text-sm text-green-700">
                                                    <strong>Celular:</strong> {resultadoVerificacao.participante.celular}
                                                </p>
                                                {resultadoVerificacao.participante.email && (
                                                    <p className="text-sm text-green-700">
                                                        <strong>Email:</strong> {resultadoVerificacao.participante.email}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="border rounded-lg p-4">
                                                <h5 className="font-semibold text-gray-800 mb-3">Seus Números:</h5>
                                                <div className="grid grid-cols-4 gap-2 mb-4">
                                                    {resultadoVerificacao.numeros.map((numero, index) => (
                                                        <div
                                                            key={index}
                                                            className={`
                                                                text-center py-2 px-3 rounded font-semibold text-sm
                                                                ${numero.status === 'vendido' || numero.status === 'pago'
                                                                    ? 'bg-green-100 text-green-800 border border-green-300'
                                                                    : numero.status === 'reservado'
                                                                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                                                                        : 'bg-gray-100 text-gray-800 border border-gray-300'
                                                                }
                                                            `}
                                                        >
                                                            {numero.numero}
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span>Total de números:</span>
                                                        <span className="font-semibold">{resultadoVerificacao.totalNumeros}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Valor total:</span>
                                                        <span className="font-semibold text-green-600">
                                                            R$ {resultadoVerificacao.valorTotal}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Status:</span>
                                                        <span className={`font-semibold ${resultadoVerificacao.statusGeral === 'vendido' || resultadoVerificacao.statusGeral === 'pago'
                                                            ? 'text-green-600'
                                                            : resultadoVerificacao.statusGeral === 'reservado'
                                                                ? 'text-yellow-600'
                                                                : 'text-gray-600'
                                                            }`}>
                                                            {resultadoVerificacao.statusGeral === 'vendido' || resultadoVerificacao.statusGeral === 'pago' ? 'Pago' :
                                                                resultadoVerificacao.statusGeral === 'reservado' ? 'Reservado' : 'Pendente'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    setCelularVerificacao('');
                                                    setResultadoVerificacao(null);
                                                }}
                                                className="w-full bg-gray-500 text-white py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                                            >
                                                Verificar Outro Número
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default RifaPublica;
