import { HiOutlineX } from 'react-icons/hi';
import { LuTriangleAlert } from 'react-icons/lu';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    subtitle?: string;
    details?: { label: string; value: string }[];
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    subtitle,
    details,
    confirmText = 'تایید',
    cancelText = 'انصراف',
    isDestructive = true
}: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" dir="rtl">
            <div className="bg-white rounded-2xl w-full max-w-[400px] shadow-2xl overflow-hidden flex flex-col relative animate-[scaleIn_0.2s_ease-out]">
                <button
                    onClick={onClose}
                    className="absolute left-4 top-4 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
                >
                    <HiOutlineX size={20} />
                </button>

                <div className="p-6 pt-10 flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isDestructive ? 'bg-red-50 text-red-500' : 'bg-primary-50 text-primary-500'}`}>
                        <LuTriangleAlert size={24} />
                    </div>

                    <h3 className={`text-base font-bold text-gray-900 ${subtitle ? 'mb-2' : 'mb-6'} text-center`}>
                        {title}
                    </h3>

                    {subtitle && (
                        <p className="text-[13px] text-gray-600 font-medium mb-6 text-center">{subtitle}</p>
                    )}

                    {details && details.length > 0 && (
                        <div className="w-full bg-gray-50 rounded-xl p-4 flex flex-col gap-3">
                            {details.map((detail, index) => (
                                <div key={index} className="flex justify-between items-center text-[13px]">
                                    <span className="text-gray-500 font-medium">{detail.label}</span>
                                    <span className="text-gray-900 font-bold">{detail.value}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-6 pt-2 flex gap-3">
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 py-3 text-white rounded-full text-[13px] font-bold shadow-sm transition-colors
                            ${isDestructive ? 'bg-red-500 hover:bg-red-600' : 'bg-primary-500 hover:bg-primary-600'}`}
                    >
                        {confirmText}
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 rounded-full text-[13px] font-bold hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>
    );
}
