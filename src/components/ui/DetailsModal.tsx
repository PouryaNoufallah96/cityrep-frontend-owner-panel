import type { ReactNode } from 'react';
import { HiOutlineX } from 'react-icons/hi';

interface DetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    details: { label: string; value: ReactNode }[];
    closeText?: string;
}

export default function DetailsModal({
    isOpen,
    onClose,
    title,
    details,
    closeText = 'بستن'
}: DetailsModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" dir="rtl">
            <div className="bg-white rounded-2xl w-full max-w-[400px] shadow-2xl overflow-hidden flex flex-col animate-[scaleIn_0.2s_ease-out]">
                <div className="relative flex items-center justify-center px-4 pt-5 pb-1">
                    <span className="text-[14px] font-bold text-gray-800">{title}</span>
                    <button onClick={onClose} className="absolute left-4 top-4 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                        <HiOutlineX size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <div className="w-full bg-gray-50 rounded-xl p-4 flex flex-col gap-3">
                        {details.map((detail, index) => (
                            <div key={index} className="flex justify-between items-center text-[13px]">
                                <span className="text-gray-500 font-medium">{detail.label}</span>
                                <span className="text-gray-900 font-bold">{detail.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 pt-2">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-primary-500 text-white rounded-full text-[13px] font-bold shadow-sm hover:bg-primary-600 transition-colors"
                    >
                        {closeText}
                    </button>
                </div>
            </div>
        </div>
    );
}
