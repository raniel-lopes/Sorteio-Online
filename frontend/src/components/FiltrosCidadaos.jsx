import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Componente de Filtros
const FiltrosCidadaos = ({ filters, onFilterChange, onApplyFilters, onClearFilters }) => {
    return (
        <div className="bg-white p-5 rounded-xl shadow mb-12 font-sans">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Filtrar Cidadãos</h4>
            <form
                className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5"
                onSubmit={e => { e.preventDefault(); onApplyFilters(); }}
            >
                {/* Tags */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="filtro-tag">Tags</label>
                    <Input
                        id="filtro-tag"
                        placeholder="Digite a tag"
                        type="text"
                        value={filters.tag}
                        onChange={e => onFilterChange('tag', e.target.value)}
                    />
                </div>
                {/* Somente Líder */}
                <div className="flex items-center space-x-2 mt-6">
                    <Checkbox
                        id="lider"
                        checked={filters.isLider}
                        onCheckedChange={checked => onFilterChange('isLider', checked)}
                    />
                    <label htmlFor="lider" className="text-sm text-gray-700 cursor-pointer">Somente Líder?</label>
                </div>
                {/* Somente Autoridade */}
                <div className="flex items-center space-x-2 mt-6">
                    <Checkbox
                        id="autoridade"
                        checked={filters.isAutoridade}
                        onCheckedChange={checked => onFilterChange('isAutoridade', checked)}
                    />
                    <label htmlFor="autoridade" className="text-sm text-gray-700 cursor-pointer">Somente Autoridade?</label>
                </div>
                {/* Potencial mínimo */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="pot-min">Potencial mínimo</label>
                    <Input
                        id="pot-min"
                        placeholder="Potencial mínimo"
                        type="number"
                        value={filters.minPotencial}
                        onChange={e => onFilterChange('minPotencial', e.target.value)}
                    />
                </div>
                {/* Potencial máximo */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="pot-max">Potencial máximo</label>
                    <Input
                        id="pot-max"
                        placeholder="Potencial máximo"
                        type="number"
                        value={filters.maxPotencial}
                        onChange={e => onFilterChange('maxPotencial', e.target.value)}
                    />
                </div>
                {/* Idade mínima */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="idade-min">Idade mínima</label>
                    <Input
                        id="idade-min"
                        placeholder="Idade mínima"
                        type="number"
                        value={filters.minIdade}
                        onChange={e => onFilterChange('minIdade', e.target.value)}
                    />
                </div>
                {/* Idade máxima */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="idade-max">Idade máxima</label>
                    <Input
                        id="idade-max"
                        placeholder="Idade máxima"
                        type="number"
                        value={filters.maxIdade}
                        onChange={e => onFilterChange('maxIdade', e.target.value)}
                    />
                </div>
                {/* Cidade */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="cidade">Cidade</label>
                    <Input
                        id="cidade"
                        placeholder="Digite a cidade"
                        type="text"
                        value={filters.cidade}
                        onChange={e => onFilterChange('cidade', e.target.value)}
                    />
                </div>
                {/* Bairro */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="bairro">Bairro</label>
                    <Input
                        id="bairro"
                        placeholder="Digite o bairro"
                        type="text"
                        value={filters.bairro}
                        onChange={e => onFilterChange('bairro', e.target.value)}
                    />
                </div>
                {/* Rua */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="rua">Rua</label>
                    <Input
                        id="rua"
                        placeholder="Digite a rua"
                        type="text"
                        value={filters.rua}
                        onChange={e => onFilterChange('rua', e.target.value)}
                    />
                </div>
                {/* Indicado por */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="indicadoPor">Indicado por</label>
                    <Input
                        id="indicadoPor"
                        placeholder="Digite quem indicou"
                        type="text"
                        value={filters.indicadoPor}
                        onChange={e => onFilterChange('indicadoPor', e.target.value)}
                    />
                </div>
                {/* Origem */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="origem">Origem</label>
                    <Input
                        id="origem"
                        placeholder="Digite a origem"
                        type="text"
                        value={filters.origem}
                        onChange={e => onFilterChange('origem', e.target.value)}
                    />
                </div>
                {/* Gênero */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="genero">Gênero</label>
                    <Input
                        id="genero"
                        placeholder="Digite o gênero"
                        type="text"
                        value={filters.genero}
                        onChange={e => onFilterChange('genero', e.target.value)}
                    />
                </div>
                {/* Cadastrado por */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="cadastradoPor">Cadastrado por</label>
                    <Input
                        id="cadastradoPor"
                        placeholder="Digite quem cadastrou"
                        type="text"
                        value={filters.cadastradoPor}
                        onChange={e => onFilterChange('cadastradoPor', e.target.value)}
                    />
                </div>
                {/* Ocupação */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="ocupacao">Ocupação</label>
                    <Input
                        id="ocupacao"
                        placeholder="Digite a ocupação"
                        type="text"
                        value={filters.ocupacao}
                        onChange={e => onFilterChange('ocupacao', e.target.value)}
                    />
                </div>
                {/* Período Início */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="periodoInicio">Período Início</label>
                    <Input
                        id="periodoInicio"
                        type="date"
                        value={filters.periodoInicio}
                        onChange={e => onFilterChange('periodoInicio', e.target.value)}
                    />
                </div>
                {/* Período Fim */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="periodoFim">Período Fim</label>
                    <Input
                        id="periodoFim"
                        type="date"
                        value={filters.periodoFim}
                        onChange={e => onFilterChange('periodoFim', e.target.value)}
                    />
                </div>
                {/* Botões */}
                <div className="col-span-full flex justify-end space-x-4 mt-4">
                    <Button type="button" variant="outline" onClick={onClearFilters}>Limpar Filtros</Button>
                    <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">
                        Aplicar Filtros
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default FiltrosCidadaos;
