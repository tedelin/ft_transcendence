import { useState, useEffect } from 'react';
import '../styles/modal.css'; 

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    className?: string;
}

export function Modal({ isOpen, onClose, children, className = "modal-content", title = "" }: ModalProps) {
    const [isVisible, setIsVisible] = useState(isOpen);

    function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    useEffect(() => {
        setIsVisible(isOpen);
    }, [isOpen]);

    return isVisible ? (
        <div className="modal" onClick={handleBackdropClick} onKeyDown={handleKeyDown}>
            <div className={className} onKeyDown={handleKeyDown}>
                <h2 className='modalTitle'>{title}</h2>
                {children}
            </div>
        </div>
    ) : null;
};
