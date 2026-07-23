import { LuTriangleAlert, LuX } from 'react-icons/lu';
import { toPersianDigits } from '../../../utils/format';

export interface ClassItemData {
    id: string;
    gymId?: string;
    gymTrendId?: string;
    day: string;
    sport: string;
    gender: string;
    price: string | number;
    time: string;
    reservations: number;
    isActive: boolean;
}

interface StatusToggleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    classData: ClassItemData | null;
    isLoading?: boolean;
}

export default function StatusToggleModal({ isOpen, onClose, onConfirm, classData, isLoading = false }: StatusToggleModalProps) {
    if (!isOpen || !classData) return null;

    const isDeactivating = classData.isActive;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" dir="rtl">
            <div className="bg-white rounded-[20px] w-full max-w-[440px] shadow-2xl relative animate-[scaleIn_0.2s_ease-out] p-6 pb-8">

                <button onClick={onClose} className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                    <LuX size={20} />
                </button>

                <div className="flex flex-col items-center mt-2 mb-8">
                    <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 mb-4 border-[6px] border-amber-50/50">
                        <LuTriangleAlert size={24} />
                    </div>
                    <h3 className="text-[16px] font-bold text-gray-900 mb-1">
                        {isDeactivating ? 'غیرفعال کردن سانس' : 'فعال کردن سانس'}
                    </h3>
                    <p className="text-[13px] text-gray-500">
                        {isDeactivating ? 'آیا از غیرفعال کردن سانس مطمئن هستید؟' : 'آیا از فعال کردن سانس مطمئن هستید؟'}
                    </p>
                </div>

                <div className="flex flex-col gap-3 py-6 px-4 bg-gray-50/50 rounded-xl mb-6 border border-gray-100">
                    <div className="flex justify-between items-center text-[13px]">
                        <span className="text-gray-500">روز</span>
                        <span className="font-semibold text-gray-800">{classData.day}</span>
                    </div>
                    <div className="flex justify-between items-center text-[13px]">
                        <span className="text-gray-500">نام رشته</span>
                        <span className="font-semibold text-gray-800">{classData.sport}</span>
                    </div>
                    <div className="flex justify-between items-center text-[13px]">
                        <span className="text-gray-500">جنسیت</span>
                        <span className="font-semibold text-gray-800">{classData.gender}</span>
                    </div>
                    <div className="flex justify-between items-center text-[13px]">
                        <span className="text-gray-500">مبلغ (تومان)</span>
                        <span className="font-semibold text-gray-800">{classData.price}</span>
                    </div>
                    <div className="flex justify-between items-center text-[13px]">
                        <span className="text-gray-500">زمان ورزش</span>
                        <span className="font-semibold text-gray-800" dir="ltr">{classData.time}</span>
                    </div>
                    <div className="flex justify-between items-center text-[13px]">
                        <span className="text-gray-500">تعداد رزرو</span>
                        <span className="font-semibold text-gray-800">{toPersianDigits(classData.reservations)}</span>
                    </div>
                </div>

                <div className="flex gap-3 p-4 bg-amber-50 rounded-xl mb-7 border border-amber-100/50">
                    <LuTriangleAlert className="text-amber-500 shrink-0 mt-0.5" size={18} />
                    <p className="text-[12px] text-amber-700 font-medium leading-relaxed">
                        {isDeactivating
                            ? 'با غیرفعال کردن سانس، این سانس برای کاربران نمایش داده نمی‌شود.'
                            : 'با فعال کردن سانس، این سانس برای کاربران نمایش داده می‌شود.'
                        }
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex-1 py-3 bg-primary-500 text-white rounded-full text-[13px] font-bold hover:bg-primary-600 transition-colors disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>در حال ثبت...</span>
                            </>
                        ) : (
                            'تایید'
                        )}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 rounded-full text-[13px] font-bold hover:bg-gray-50 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        انصراف
                    </button>
                </div>

            </div>
        </div>
    );
}
