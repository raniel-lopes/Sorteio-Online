import { Button } from "@/components/ui/button";

// Componente de Modal simples e reutilizável
const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-brightness-75 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-lg shadow-2xl border max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
                <div className="mb-1 flex justify-between items-center">
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <button
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                        onClick={onClose}
                        title="Fechar"
                    >
                        &times;
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

export default Modal;