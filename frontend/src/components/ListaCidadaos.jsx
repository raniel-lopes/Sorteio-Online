import React, { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusCircle, MoreVertical } from "lucide-react";
import { createPortal } from "react-dom";


const PAGE_SIZE = 10;

// Componente da Lista de Cidadãos
function ListaCidadaos({ cidadaos, onAddCidadao, onEditCidadao, onDeleteCidadao, filters, onFilterChange }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const filteredBySearch = useMemo(() => {
        if (!searchTerm) return cidadaos;
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return cidadaos.filter(
            (c) =>
                c.nome.toLowerCase().includes(lowerCaseSearchTerm) ||
                c.telefone.toLowerCase().includes(lowerCaseSearchTerm) ||
                c.bairro.toLowerCase().includes(lowerCaseSearchTerm) ||
                c.cidade.toLowerCase().includes(lowerCaseSearchTerm) ||
                c.tags.toLowerCase().includes(lowerCaseSearchTerm) ||
                c.genero.toLowerCase().includes(lowerCaseSearchTerm) ||
                c.ocupacao.toLowerCase().includes(lowerCaseSearchTerm)
        );
    }, [cidadaos, searchTerm]);

    const totalPages = Math.ceil(filteredBySearch.length / PAGE_SIZE);
    const startIdx = (currentPage - 1) * PAGE_SIZE;
    const endIdx = startIdx + PAGE_SIZE;
    const currentCidadaos = filteredBySearch.slice(startIdx, endIdx);

    // Função para gerar os números das páginas (com ... quando necessário)
    function getPageNumbers() {
        const pages = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 4) {
                pages.push(1, 2, 3, 4, 5, "...", totalPages);
            } else if (currentPage >= totalPages - 3) {
                pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
            }
        }
        return pages;
    }

    return (
        <div className="bg-white p-4 rounded-xl shadow">
            <div className="flex flex-col md:flex-row justify-between mb-4 gap-2">
                <Input
                    placeholder="Buscar por nome, telefone, bairro, etc."
                    className="md:w-1/3"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="space-x-2 flex items-center">
                    <Button variant="outline">Selecionar Duplicados</Button>
                    <Button className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1" onClick={onAddCidadao}>
                        <PlusCircle className="h-4 w-4" /> Novo Cidadão
                    </Button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg shadow overflow-hidden">
                    <thead>
                        <tr className="bg-gray-100 text-gray-700 text-sm">
                            <th className="px-4 py-2 text-left font-semibold">NOME</th>
                            <th className="px-4 py-2 text-left font-semibold">TELEFONE</th>
                            <th className="px-4 py-2 text-left font-semibold">BAIRRO</th>
                            <th className="px-4 py-2 text-left font-semibold">CIDADE</th>
                            <th className="px-4 py-2 text-left font-semibold">TAGS</th>
                            <th className="px-4 py-2 text-left font-semibold">POTENCIAL DE VOTOS</th>
                            <th className="px-4 py-2 text-left font-semibold">AÇÕES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentCidadaos.map((cidadao) => (
                            <tr key={cidadao.id} className="hover:bg-gray-50">
                                <td className="px-4 py-2 font-medium text-gray-800">{cidadao.nome}</td>
                                <td className="px-4 py-2 text-blue-700 font-medium flex items-center gap-2">
                                    {cidadao.telefone}
                                    {/* Exemplo de ícone WhatsApp */}
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12.04 2.003c-5.523 0-10 4.477-10 10 0 1.768.464 3.497 1.345 5.01l-1.41 5.164a1 1 0 0 0 1.213 1.213l5.164-1.41A9.96 9.96 0 0 0 12.04 22c5.523 0 10-4.477 10-10s-4.477-9.997-10-9.997zm0 18.001a7.96 7.96 0 0 1-4.09-1.16l-.292-.172-3.068.838.838-3.068-.172-.292A7.96 7.96 0 0 1 4.04 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8.004-8 8.004zm4.406-5.845c-.242-.121-1.434-.707-1.655-.788-.222-.081-.384-.121-.546.121-.161.242-.626.788-.769.95-.141.161-.282.182-.524.061-.242-.121-1.022-.377-1.946-1.202-.72-.642-1.207-1.434-1.35-1.676-.141-.242-.015-.373.106-.494.109-.108.242-.282.363-.423.121-.141.161-.242.242-.404.081-.161.04-.303-.02-.424-.061-.121-.546-1.318-.748-1.803-.197-.473-.398-.409-.546-.417l-.464-.008c-.161 0-.424.06-.646.303-.222.242-.848.828-.848 2.018 0 1.19.868 2.341.989 2.502.121.161 1.708 2.61 4.143 3.557.579.199 1.029.317 1.38.406.579.147 1.106.126 1.523.077.465-.055 1.434-.586 1.637-1.152.202-.566.202-1.051.141-1.152-.06-.101-.22-.161-.462-.282z" />
                                    </svg>
                                </td>
                                <td className="px-4 py-2 text-gray-700">{cidadao.bairro}</td>
                                <td className="px-4 py-2 text-gray-700">{cidadao.cidade}</td>
                                <td className="px-4 py-2 text-gray-700">{cidadao.tags}</td>
                                <td className="px-4 py-2 text-gray-700">{cidadao.votos}</td>
                                <td className="px-4 py-2">
                                    <ActionMenu
                                        onEdit={() => onEditCidadao(cidadao)}
                                        onDelete={() => {
                                            console.log("Chamando onDeleteCidadao em ListaCidadaos", cidadao.id);
                                            onDeleteCidadao(cidadao.id);
                                        }}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Paginação */}
            <div className="flex justify-end items-center mt-4 space-x-1">
                <button
                    className="px-2 py-1 rounded hover:bg-gray-200"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                    &lt;
                </button>
                {getPageNumbers().map((page, idx) =>
                    page === "..." ? (
                        <span key={idx} className="px-2 py-1 text-gray-400">...</span>
                    ) : (
                        <button
                            key={page}
                            className={`px-3 py-1 rounded-full ${currentPage === page
                                ? "bg-blue-600 text-white font-bold"
                                : "hover:bg-gray-200"
                                }`}
                            onClick={() => setCurrentPage(page)}
                        >
                            {page}
                        </button>
                    )
                )}
                <button
                    className="px-2 py-1 rounded hover:bg-gray-200"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                    &gt;
                </button>
            </div>
        </div>
    );
};

function ActionMenu({ onEdit, onDelete }) {
    const [open, setOpen] = useState(false);
    const [menuStyle, setMenuStyle] = useState({});
    const buttonRef = useRef();

    useEffect(() => {
        if (open && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const menuHeight = 90; // altura aproximada do menu
            const spaceBelow = window.innerHeight - rect.bottom;
            let top = rect.bottom + window.scrollY + 4;
            let left = rect.right + window.scrollX - 160; // 160 = largura do menu

            // Se não couber para baixo, abre para cima
            if (spaceBelow < menuHeight) {
                top = rect.top + window.scrollY - menuHeight - 4;
            }

            setMenuStyle({
                position: "absolute",
                top: `${top}px`,
                left: `${left}px`,
                zIndex: 9999,
                minWidth: "160px"
            });
        }
    }, [open]);

    // Fecha ao clicar fora
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                buttonRef.current &&
                !buttonRef.current.contains(event.target)
            ) {
                setOpen(false);
            }
        }
        if (open) {
            document.addEventListener("click", handleClickOutside);
        }
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [open]);

    return (
        <>
            <button
                ref={buttonRef}
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setOpen((v) => !v)}
                title="Ações"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="12" cy="12" r="1.5" />
                    <circle cx="19.5" cy="12" r="1.5" />
                    <circle cx="4.5" cy="12" r="1.5" />
                </svg>
            </button>
            {open &&
                createPortal(
                    <div
                        style={menuStyle}
                        className="bg-white border border-gray-200 rounded shadow-lg py-1"
                    >
                        <button
                            className="flex items-center w-full px-4 py-2 text-blue-600 hover:bg-gray-100"
                            onClick={() => { setOpen(false); onEdit(); }}
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <rect x="4" y="4" width="16" height="16" rx="2" />
                                <path d="M9 9h6v6H9z" />
                            </svg>
                            Editar
                        </button>
                        <button
                            className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-gray-100"
                            onClick={(event) => {
                                event.stopPropagation();
                                console.log("Cliquei em Deletar no ActionMenu");
                                setOpen(false);
                                onDelete();
                            }}
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <rect x="6" y="6" width="12" height="12" rx="2" />
                                <path d="M9 9l6 6M15 9l-6 6" />
                            </svg>
                            Deletar
                        </button>
                    </div>,
                    document.body
                )
            }
        </>
    );
}

export default ListaCidadaos;