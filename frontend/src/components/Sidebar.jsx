import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Home, Users, Ticket, Trophy, CreditCard, Settings, Gift } from "lucide-react";

const menuItems = [
    { label: "Dashboard", icon: <Home size={20} />, link: "/dashboard" },
    { label: "Rifas", icon: <Gift size={20} />, link: "/rifas" },
    {
        label: "Pagamentos",
        icon: <CreditCard size={20} />,
        link: "/pagamentos",
        submenu: [
            { label: "Lista de Pagamentos", link: "/pagamentos" },
            { label: "Validar Pagamentos", link: "/pagamentos/validar" }
        ]
    },
    { label: "Participantes", icon: <Users size={20} />, link: "/participantes" },
    { label: "Configurações", icon: <Settings size={20} />, link: "/configuracoes" },
    { label: "Usuários", icon: <Users size={20} />, link: "/usuarios" }
];

export default function Sidebar() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [openMenu, setOpenMenu] = useState(null);

    const toggleMenu = (index) => {
        setOpenMenu(openMenu === index ? null : index);
    };

    return (
        <div
            className={`h-screen bg-white border-r shadow-lg flex flex-col transition-all duration-300 ${isExpanded ? "w-64" : "w-16"
                } overflow-hidden`}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            {/* Logo fixa */}
            <div className="navbar-header mb-2">
                <ul className="nav navbar-nav flex-row">
                    <li className="nav-item mr-auto">
                        <a
                            aria-current="page"
                            className="navbar-brand active flex items-center justify-center h-16"
                            href="/"
                        >
                            <span className="brand-logo">
                                <img
                                    src="./images/Sorteio-online.png"
                                    alt="Logo Sorteio Online"
                                    className="h-14 w-auto" // Tamanho fixo da logo
                                />
                            </span>
                        </a>
                    </li>
                </ul>
            </div>

            {/* Menu */}
            <nav className="flex-1 overflow-y-auto p-2">
                <ul className="space-y-2">
                    {menuItems.map((item, index) => {
                        // Adiciona o título "Gestão" antes do item "Usuários"
                        if (item.label === "Usuários") {
                            return (
                                <React.Fragment key={index}>
                                    <li className="px-2 pt-4 pb-1">
                                        <span className="text-xs uppercase text-gray-400 tracking-wider">Gestão</span>
                                    </li>
                                    <li>
                                        <Link
                                            to={item.link}
                                            className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100"
                                        >
                                            {item.icon}
                                            {isExpanded && <span>{item.label}</span>}
                                        </Link>
                                    </li>
                                </React.Fragment>
                            );
                        }
                        // Renderiza os outros itens normalmente
                        return (
                            <li key={index}>
                                {item.submenu ? (
                                    <>
                                        <button
                                            onClick={() => toggleMenu(index)}
                                            className="flex items-center justify-between w-full text-left p-2 rounded-md hover:bg-gray-100"
                                        >
                                            <div className="flex items-center gap-3">
                                                {item.icon}
                                                {isExpanded && <span>{item.label}</span>}
                                            </div>
                                            {isExpanded && (
                                                <svg
                                                    className={`transition-transform ${openMenu === index ? "rotate-90" : ""}`}
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <polyline points="6 9 12 15 18 9" />
                                                </svg>
                                            )}
                                        </button>
                                        {openMenu === index && isExpanded && (
                                            <ul className="pl-8 mt-1 space-y-1">
                                                {item.submenu.map((subItem, subIndex) => (
                                                    <li key={subIndex}>
                                                        <Link
                                                            to={subItem.link}
                                                            className="block p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                                                        >
                                                            {subItem.label}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </>
                                ) : (
                                    <Link
                                        to={item.link}
                                        className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100"
                                    >
                                        {item.icon}
                                        {isExpanded && <span>{item.label}</span>}
                                    </Link>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </div>
    );
}