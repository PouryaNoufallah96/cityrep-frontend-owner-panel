import { HiOutlineX } from 'react-icons/hi';
import type { StepProps, GymFormData } from '../types';

export default function GymInfoStep({ formData, updateField, clearField }: StepProps) {
    const renderInput = (
        field: keyof GymFormData,
        label: string,
        placeholder: string,
        dir: string = 'rtl'
    ) => {
        const value = formData[field] as string;
        return (
            <div className="mb-6">
                <label className="block text-right text-[13px] font-semibold text-gray-900 mb-2">
                    {label}
                </label>
                <div className="relative flex items-center">
                    <input
                        type="text"
                        className="w-full px-4 py-3.5 border-[1.5px] border-gray-200 rounded-[10px] text-sm text-gray-900 bg-white transition-all duration-200 placeholder:text-gray-400 focus:border-primary-400 focus:ring-[3px] focus:ring-primary-400/10 outline-none"
                        placeholder={placeholder}
                        value={value}
                        onChange={(e) => updateField(field, e.target.value)}
                        dir={dir}
                        style={{ textAlign: 'right' }}
                    />
                    {value && (
                        <button
                            type="button"
                            className="absolute left-3.5 text-gray-400 hover:text-red-500 transition-colors flex items-center"
                            onClick={() => clearField(field)}
                        >
                            <HiOutlineX size={16} />
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="animate-[fadeIn_0.3s_ease-out]">
            {renderInput('title', 'نام باشگاه', 'نام باشگاه')}
            {renderInput('phoneNumber', 'شماره تماس', 'شماره تماس', 'ltr')}

            <div className="mb-6">
                <label className="block text-right text-[13px] font-semibold text-gray-900 mb-2">
                    جنسیت
                </label>
                <div className="relative">
                    <select
                        className="w-full px-4 py-3.5 border-[1.5px] border-gray-200 rounded-[10px] text-sm text-gray-900 bg-white transition-all duration-200 focus:border-primary-400 focus:ring-[3px] focus:ring-primary-400/10 outline-none appearance-none cursor-pointer"
                        value={formData.supportedGender}
                        onChange={(e) => updateField('supportedGender', e.target.value)}
                        dir="rtl"
                    >
                        <option value="">جنسیت مورد پذیرش باشگاه را انتخاب کنید</option>
                        <option value="Male">مردانه</option>
                        <option value="Female">زنانه</option>
                        <option value="Both">هر دو</option>
                    </select>
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 9l6 6 6-6" />
                        </svg>
                    </div>
                </div>
            </div>

            {renderInput('address', 'آدرس', 'آدرس')}
        </div>
    );
}
