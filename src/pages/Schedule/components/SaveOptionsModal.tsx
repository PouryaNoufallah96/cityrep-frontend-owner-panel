import { HiOutlineSave, HiOutlineX } from 'react-icons/hi';

interface SaveOptionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveCurrent: () => void;
    onSaveAll: () => void;
    hasOtherChanges?: boolean;
}

export default function SaveOptionsModal({
    isOpen,
    onClose,
    onSaveCurrent,
    onSaveAll,
    hasOtherChanges
}: SaveOptionsModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" dir="rtl">
            <div className="bg-white rounded-2xl w-full max-w-[400px] shadow-2xl overflow-hidden flex flex-col animate-[scaleIn_0.2s_ease-out]">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                        <HiOutlineX size={20} />
                    </button>
                    <div className="w-6" /> {/* Spacer */}
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-primary-50 text-primary-500 flex items-center justify-center mb-4">
                        <HiOutlineSave size={28} />
                    </div>

                    <h3 className="text-base font-bold text-gray-900 mb-2">
                        ذخیره تغییرات
                    </h3>
                    <p className="text-[13px] text-gray-500 text-center mb-6">
                        شما در رشته‌های دیگر نیز تغییرات ذخیره نشده دارید. آیا مایلید همه آن‌ها ثبت شوند؟
                    </p>
                </div>

                {/* Footer Buttons */}
                <div className="p-6 pt-0 flex flex-col gap-3">
                    {hasOtherChanges && (
                        <button
                            onClick={() => { onSaveAll(); onClose(); }}
                            className="w-full py-3 bg-primary-600 text-white rounded-xl text-[13px] font-bold shadow-sm hover:bg-primary-700 transition-colors"
                        >
                            ذخیره تمام رشته‌ها
                        </button>
                    )}
                    <button
                        onClick={() => { onSaveCurrent(); onClose(); }}
                        className="w-full py-3 bg-white border-2 border-primary-100 text-primary-600 rounded-xl text-[13px] font-bold hover:bg-primary-50 transition-colors"
                    >
                        ذخیره فقط رشته فعلی
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-[13px] font-bold hover:bg-gray-50 transition-colors"
                    >
                        انصراف
                    </button>
                </div>
            </div>
        </div>
    );
}
