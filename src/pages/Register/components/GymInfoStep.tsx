import { HiOutlineX } from 'react-icons/hi';
import { LuChevronDown } from 'react-icons/lu';
import Input from '../../../components/ui/Input';
import { toPersianDigits } from '../../../utils/format';
import type { StepProps, GymFormData } from '../types';

const toEnglishDigits = (value: string) =>
    value.replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));

export default function GymInfoStep({ formData, updateField, clearField }: StepProps) {
    const clearButton = (field: keyof GymFormData, value: string) =>
        value ? (
            <button
                type="button"
                className="hover:text-gray-600 transition-colors flex items-center"
                onClick={() => clearField(field)}
                aria-label="پاک کردن"
            >
                <HiOutlineX size={15} />
            </button>
        ) : null;

    return (
        <div className="bg-[#F9F9F9] rounded-2xl p-6 flex flex-col gap-5 animate-[fadeIn_0.3s_ease-out]">
            <Input
                label="نام باشگاه"
                placeholder="نام باشگاه"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                suffix={clearButton('title', formData.title)}
            />

            <Input
                label="شماره تماس"
                placeholder="شماره تماس"
                value={toPersianDigits(formData.phoneNumber)}
                onChange={(e) => updateField('phoneNumber', toEnglishDigits(e.target.value))}
                dir="ltr"
                suffix={clearButton('phoneNumber', formData.phoneNumber)}
            />

            <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-700 text-right">جنسیت</label>
                <div className="relative flex items-center">
                    <select
                        className={`w-full h-12 px-4 border border-gray-200 rounded-xl text-[14px] bg-white transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-50 outline-none appearance-none cursor-pointer ${formData.supportedGender ? 'text-gray-800' : 'text-gray-400'}`}
                        value={formData.supportedGender}
                        onChange={(e) => updateField('supportedGender', e.target.value)}
                        dir="rtl"
                    >
                        <option value="">جنسیت مورد پذیرش باشگاه را انتخاب کنید</option>
                        <option value="Male">مردانه</option>
                        <option value="Female">زنانه</option>
                        <option value="Both">هر دو</option>
                    </select>
                    <LuChevronDown size={18} className="absolute left-3 text-gray-400 pointer-events-none" />
                </div>
            </div>

            <Input
                label="آدرس"
                placeholder="آدرس"
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
                suffix={clearButton('address', formData.address)}
            />
        </div>
    );
}
