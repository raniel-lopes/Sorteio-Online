// Componente para o formulário de Adicionar/Editar Cidadão
const CidadaoForm = ({ initialData, onSave, onClose }) => {
    const [formData, setFormData] = useState(
        initialData || {
            nome: "",
            telefone: "",
            bairro: "",
            cidade: "",
            tags: "",
            votos: 0,
            isLider: false,
            isAutoridade: false,
            dataCadastro: new Date().toISOString().split('T')[0],
            idade: 0,
            genero: "",
            indicadoPor: "",
            origem: "",
            ocupacao: "",
        }
    );

    const handleChange = (e) => {
        const { id, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [id]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSelectChange = (name, value) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <Input id="nome" value={formData.nome} onChange={handleChange} required />
            </div>
            <div>
                <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <Input id="telefone" value={formData.telefone} onChange={handleChange} />
            </div>
            <div>
                <label htmlFor="bairro" className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                <Input id="bairro" value={formData.bairro} onChange={handleChange} />
            </div>
            <div>
                <label htmlFor="cidade" className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                <Input id="cidade" value={formData.cidade} onChange={handleChange} />
            </div>
            <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">Tags (separadas por vírgula)</label>
                <Input id="tags" value={formData.tags} onChange={handleChange} placeholder="Ex: família, trabalho" />
            </div>
            <div>
                <label htmlFor="votos" className="block text-sm font-medium text-gray-700 mb-1">Potencial de Votos</label>
                <Input id="votos" type="number" value={formData.votos} onChange={handleChange} />
            </div>
            <div>
                <label htmlFor="idade" className="block text-sm font-medium text-gray-700 mb-1">Idade</label>
                <Input id="idade" type="number" value={formData.idade} onChange={handleChange} />
            </div>
            {/* Select para Gênero */}
            <div>
                <label htmlFor="genero" className="block text-sm font-medium text-gray-700 mb-1">Gênero</label>
                <Select value={formData.genero} onValueChange={(value) => handleSelectChange('genero', value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione o Gênero" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">Não definido</SelectItem>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="feminino">Feminino</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {/* Select para Indicado por */}
            <div>
                <label htmlFor="indicadoPor" className="block text-sm font-medium text-gray-700 mb-1">Indicado por</label>
                <Select value={formData.indicadoPor} onValueChange={(value) => handleSelectChange('indicadoPor', value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione quem indicou" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">Não definido</SelectItem>
                        <SelectItem value="joao">João</SelectItem>
                        <SelectItem value="maria">Maria</SelectItem>
                        <SelectItem value="pedro">Pedro</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {/* Select para Origem */}
            <div>
                <label htmlFor="origem" className="block text-sm font-medium text-gray-700 mb-1">Origem</label>
                <Select value={formData.origem} onValueChange={(value) => handleSelectChange('origem', value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione a origem" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">Não definida</SelectItem>
                        <SelectItem value="evento">Evento</SelectItem>
                        <SelectItem value="redes_sociais">Redes Sociais</SelectItem>
                        <SelectItem value="indicacao">Indicação</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {/* Select para Ocupação */}
            <div>
                <label htmlFor="ocupacao" className="block text-sm font-medium text-gray-700 mb-1">Ocupação</label>
                <Select value={formData.ocupacao} onValueChange={(value) => handleSelectChange('ocupacao', value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione a ocupação" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">Não definida</SelectItem>
                        <SelectItem value="professor">Professor</SelectItem>
                        <SelectItem value="engenheiro">Engenheiro</SelectItem>
                        <SelectItem value="estudante">Estudante</SelectItem>
                        <SelectItem value="comerciante">Comerciante</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox id="isLider" checked={formData.isLider} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isLider: checked }))} />
                <label htmlFor="isLider" className="text-sm">É Líder?</label>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox id="isAutoridade" checked={formData.isAutoridade} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isAutoridade: checked }))} />
                <label htmlFor="isAutoridade" className="text-sm">É Autoridade?</label>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
                <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">
                    {initialData ? "Salvar Alterações" : "Adicionar Cidadão"}
                </Button>
            </div>
        </form>
    );
};
export default CidadaoForm;