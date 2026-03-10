import { useState, useEffect } from 'react';
import { LuX, LuChevronDown } from 'react-icons/lu';
import { toast } from 'react-toastify';
import { useEditGymCommonData } from '../../../hooks/useGym';

interface EditGymInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    gymId: string;
    initialData: {
        name: string;
        phone: string;
        supportedGender: string[];
        address: string;
    };
    onSave: (data: any) => void;
}

export default function EditGymInfoModal({ isOpen, onClose, gymId, initialData, onSave }: EditGymInfoModalProps) {
    const [formData, setFormData] = useState(initialData);
    const editMutation = useEditGymCommonData();

    useEffect(() => {
        setFormData(initialData);
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleClear = (field: keyof typeof formData) => {
        setFormData(prev => ({ ...prev, [field]: '' }));
    };

    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        editMutation.mutate(
            {
                gymId,
                title: formData.name,
                phoneNumber: formData.phone,
                genders: formData.supportedGender,
                addressText: formData.address,
            },
            {
                onSuccess: () => {
                    onSave(formData);
                    toast.success('اطلاعات باشگاه با موفقیت ویرایش شد');
                    onClose();
                },
                onError: (error: any) => {
                    toast.error(error.response?.data?.message || 'خطا در ویرایش اطلاعات');
                },
            }
        );
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" dir="rtl">
            <div className="bg-white rounded-2xl w-full max-w-[500px] shadow-2xl overflow-hidden flex flex-col relative animate-[scaleIn_0.2s_ease-out] p-6 pb-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex-1 flex justify-center">
                        <h3 className="text-[16px] font-bold text-gray-800">ویرایش اطلاعات باشگاه</h3>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors absolute left-4 top-4">
                        <LuX size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex flex-col gap-4">
                    {/* Name */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-bold text-gray-700">نام باشگاه</label>
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100 transition-all text-[14px] text-gray-800"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                            />
                            {formData.name && (
                                <button onClick={() => handleClear('name')} className="absolute left-3 text-gray-400 hover:text-gray-600 p-1">
                                    <LuX size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-bold text-gray-700">شماره تماس</label>
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100 transition-all text-[14px] text-gray-800"
                                value={formData.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                            />
                            {formData.phone && (
                                <button onClick={() => handleClear('phone')} className="absolute left-3 text-gray-400 hover:text-gray-600 p-1">
                                    <LuX size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Gender Dropdown */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-bold text-gray-700">جنسیت</label>
                        <div className="relative flex items-center">
                            <select
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100 transition-all text-[14px] text-gray-800 appearance-none bg-white cursor-pointer"
                                value={
                                    formData.supportedGender?.includes('Male') && formData.supportedGender?.includes('Female')
                                        ? 'Both'
                                        : formData.supportedGender?.includes('Male')
                                            ? 'Male'
                                            : formData.supportedGender?.includes('Female')
                                                ? 'Female'
                                                : ''
                                }
                                onChange={(e) => {
                                    const val = e.target.value;
                                    const genders = val === 'Both' ? ['Male', 'Female'] : val ? [val] : [];
                                    setFormData(prev => ({ ...prev, supportedGender: genders }));
                                }}
                            >
                                <option value="">انتخاب کنید</option>
                                <option value="Male">مردانه</option>
                                <option value="Female">زنانه</option>
                                <option value="Both">هر دو</option>
                            </select>
                            <LuChevronDown size={18} className="absolute left-3 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Address */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-bold text-gray-700">آدرس</label>
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100 transition-all text-[14px] text-gray-800"
                                value={formData.address}
                                onChange={(e) => handleChange('address', e.target.value)}
                            />
                            {formData.address && (
                                <button onClick={() => handleClear('address')} className="absolute left-3 text-gray-400 hover:text-gray-600 p-1">
                                    <LuX size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-4 mt-8">
                    <button
                        onClick={handleSave}
                        disabled={editMutation.isPending}
                        className="flex-1 h-[48px] bg-primary-600 text-white rounded-[12px] text-[14px] font-bold hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                        {editMutation.isPending ? 'در حال ذخیره...' : 'ثبت تغییرات'}
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 h-[48px] bg-white border-2 border-gray-200 text-gray-700 rounded-[12px] text-[14px] font-bold hover:bg-gray-50 transition-colors"
                    >
                        انصراف
                    </button>
                </div>
            </div>
        </div>
    );
}
