import { useEffect, useState } from 'react';
import axios from 'axios';

export default function EleitorFormAndList({ setEleitores, eleitores, onClose }) {
    // const [eleitores, setEleitores] = useState([]);
    const [form, setForm] = useState({
        nomeCompleto: '',
        apelido: '',
        celular: '',
        telefoneFixo: '',
        email: '',
        redeSocial: '',
        ocupacao: '',
        observacoes: '',
        tags: '',
        dataNascimento: '',
        genero: '',
        cep: '',
        estado: '',
        cidade: '',
        bairro: '',
        endereco: '',
        numero: '',
        complemento: '',
        regiao: '',
        lider: false,
        autoridade: false,
        potencialVotos: '',
        possuiPet: false,
        contatoDias: '',
        indicadoPor: ''
    });

    //  useEffect(() => {
    //     axios.get('http://localhost:5000/api/cidadaos')
    //         .then(res => setEleitores(res.data))
    //         .catch(err => console.error('Erro ao buscar eleitores:', err));
    // }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setEleitores([
            ...eleitores,
            {
                id: Date.now(),
                nome: form.nomeCompleto,           // Mapeia para 'nome'
                telefone: form.celular,            // Mapeia para 'telefone'
                bairro: form.bairro,
                cidade: form.cidade,
                tags: form.tags,
                votos: form.potencialVotos,        // Mapeia para 'votos'
                // Adicione outros campos se necessário
            }
        ]);
        setForm({
            nomeCompleto: '',
            apelido: '',
            celular: '',
            telefoneFixo: '',
            email: '',
            redeSocial: '',
            ocupacao: '',
            observacoes: '',
            tags: '',
            dataNascimento: '',
            genero: '',
            cep: '',
            estado: '',
            cidade: '',
            bairro: '',
            endereco: '',
            numero: '',
            complemento: '',
            regiao: '',
            lider: false,
            autoridade: false,
            potencialVotos: '',
            possuiPet: false,
            contatoDias: '',
            indicadoPor: ''
        });
        if (onClose) onClose(); // Fecha o modal após cadastrar
    };


    return (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto">
            <h2 className="text-xl font-semibold mb-4 text-gray-800"></h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nome Completo *</label>
                        <input
                            type="text"
                            name="nomeCompleto"
                            value={form.nomeCompleto}
                            onChange={handleChange}
                            required
                            className="border border-gray-300 rounded px-3 py-2 w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Apelido</label>
                        <input
                            type="text"
                            name="apelido"
                            value={form.apelido}
                            onChange={handleChange}
                            className="border border-gray-300 rounded px-3 py-2 w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Celular *</label>
                        <input
                            type="text"
                            name="celular"
                            placeholder="(DDD) 00000-0000"
                            value={form.celular}
                            onChange={handleChange}
                            required
                            className="border border-gray-300 rounded px-3 py-2 w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Telefone Fixo</label>
                        <input
                            type="text"
                            name="telefoneFixo"
                            placeholder="(DDD) 00000-0000"
                            value={form.telefoneFixo}
                            onChange={handleChange}
                            className="border border-gray-300 rounded px-3 py-2 w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="border border-gray-300 rounded px-3 py-2 w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Rede Social</label>
                        <input
                            type="text"
                            name="redeSocial"
                            value={form.redeSocial}
                            onChange={handleChange}
                            className="border border-gray-300 rounded px-3 py-2 w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Ocupação</label>
                        <input
                            type="text"
                            name="ocupacao"
                            value={form.ocupacao}
                            onChange={handleChange}
                            className="border border-gray-300 rounded px-3 py-2 w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Data de nascimento</label>
                        <input
                            type="date"
                            name="dataNascimento"
                            value={form.dataNascimento}
                            onChange={handleChange}
                            className="border border-gray-300 rounded px-3 py-2 w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Gênero</label>
                        <select
                            name="genero"
                            value={form.genero}
                            onChange={handleChange}
                            className="border border-gray-300 rounded px-3 py-2 w-full"
                        >
                            <option value="">Selecione...</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Feminino">Feminino</option>
                            <option value="Outro">Outro</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Cep</label>
                        <input
                            type="text"
                            name="cep"
                            placeholder="00000-000"
                            value={form.cep}
                            onChange={handleChange}
                            className="border border-gray-300 rounded px-3 py-2 w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Estado</label>
                        <input
                            type="text"
                            name="estado"
                            value={form.estado}
                            onChange={handleChange}
                            className="border border-gray-300 rounded px-3 py-2 w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Cidade</label>
                        <input
                            type="text"
                            name="cidade"
                            value={form.cidade}
                            onChange={handleChange}
                            className="border border-gray-300 rounded px-3 py-2 w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Bairro</label>
                        <input
                            type="text"
                            name="bairro"
                            value={form.bairro}
                            onChange={handleChange}
                            className="border border-gray-300 rounded px-3 py-2 w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Endereço</label>
                        <input
                            type="text"
                            name="endereco"
                            value={form.endereco}
                            onChange={handleChange}
                            className="border border-gray-300 rounded px-3 py-2 w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Número</label>
                        <input
                            type="text"
                            name="numero"
                            value={form.numero}
                            onChange={handleChange}
                            className="border border-gray-300 rounded px-3 py-2 w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Complemento</label>
                        <input
                            type="text"
                            name="complemento"
                            value={form.complemento}
                            onChange={handleChange}
                            className="border border-gray-300 rounded px-3 py-2 w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Região</label>
                        <input
                            type="text"
                            name="regiao"
                            value={form.regiao}
                            onChange={handleChange}
                            className="border border-gray-300 rounded px-3 py-2 w-full"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Observações</label>
                    <textarea
                        name="observacoes"
                        value={form.observacoes}
                        onChange={handleChange}
                        className="border border-gray-300 rounded px-3 py-2 w-full"
                        rows={2}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Tags</label>
                    <input
                        type="text"
                        name="tags"
                        placeholder="Digite as tags e pressione enter..."
                        value={form.tags}
                        onChange={handleChange}
                        className="border border-gray-300 rounded px-3 py-2 w-full"
                    />
                    <span className="text-xs text-gray-400">Exemplos: Simpatizante, Filiado, Comissionado, Multiplicador, Líder Comunitário, Líder Religioso</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                            type="checkbox"
                            name="lider"
                            checked={form.lider}
                            onChange={handleChange}
                        />
                        Líder?
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                            type="checkbox"
                            name="autoridade"
                            checked={form.autoridade}
                            onChange={handleChange}
                        />
                        Autoridade?
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                            type="checkbox"
                            name="possuiPet"
                            checked={form.possuiPet}
                            onChange={handleChange}
                        />
                        Possui pet?
                    </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Potencial de votos</label>
                        <input
                            type="number"
                            name="potencialVotos"
                            value={form.potencialVotos}
                            onChange={handleChange}
                            className="border border-gray-300 rounded px-3 py-2 w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Entrar em contato a cada 'X' dias</label>
                        <input
                            type="number"
                            name="contatoDias"
                            value={form.contatoDias}
                            onChange={handleChange}
                            className="border border-gray-300 rounded px-3 py-2 w-full"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Indicado por</label>
                    <input
                        type="text"
                        name="indicadoPor"
                        value={form.indicadoPor}
                        onChange={handleChange}
                        className="border border-gray-300 rounded px-3 py-2 w-full"
                    />
                </div>
                <button
                    type="submit"
                    className="bg-yellow-600 text-white font-semibold py-2 rounded hover:bg-yellow-700 transition mt-2"
                >
                    Cadastrar
                </button>
            </form>


        </div>
    );
}