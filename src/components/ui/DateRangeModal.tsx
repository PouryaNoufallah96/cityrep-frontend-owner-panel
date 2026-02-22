import { useState, useEffect } from 'react';
import { HiOutlineX, HiOutlineCalendar } from 'react-icons/hi';
import { Calendar, DateObject } from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import 'react-multi-date-picker/styles/colors/purple.css';

interface DateRangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (dates: DateObject[]) => void;
    initialDates?: DateObject[];
    title?: string;
    confirmText?: string;
    cancelText?: string;
}

export default function DateRangeModal({
    isOpen,
    onClose,
    onConfirm,
    initialDates = [],
    title = 'انتخاب بازه زمانی',
    confirmText = 'تایید',
    cancelText = 'انصراف'
}: DateRangeModalProps) {
    const [values, setValues] = useState<DateObject[]>(initialDates);

    useEffect(() => {
        if (isOpen) {
            setValues(initialDates);
        }
    }, [isOpen, initialDates]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" dir="rtl">
            <div className="bg-white rounded-2xl w-full max-w-[400px] shadow-2xl overflow-hidden flex flex-col animate-[scaleIn_0.2s_ease-out]">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                        <HiOutlineX size={20} />
                    </button>
                    <span className="text-[14px] font-bold text-gray-800">{title}</span>
                    <div className="w-6" /> {/* Spacer */}
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mb-6 bg-primary-50 text-primary-500">
                        <HiOutlineCalendar size={26} />
                    </div>

                    <div dir="rtl" className="flex justify-center w-full">
                        <Calendar
                            range
                            calendar={persian}
                            locale={persian_fa}
                            value={values}
                            onChange={(dateObjects) => {
                                if (Array.isArray(dateObjects)) {
                                    setValues(dateObjects as DateObject[]);
                                } else if (dateObjects) {
                                    setValues([dateObjects as DateObject]);
                                } else {
                                    setValues([]);
                                }
                            }}
                            className="purple"
                        />
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-6 pt-2 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-[13px] font-bold hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm(values);
                            onClose();
                        }}
                        className="flex-1 py-3 bg-primary-500 text-white rounded-xl text-[13px] font-bold shadow-sm hover:bg-primary-600 transition-colors"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
