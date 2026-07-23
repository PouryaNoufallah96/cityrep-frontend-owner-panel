import { useState, useEffect } from 'react';
import { LuX, LuChevronDown } from 'react-icons/lu';
import { toast } from 'react-toastify';
import { useEditGymCommonData } from '../../../hooks/useGym';
import Input from '../../../components/ui/Input';

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
    onSave: (data: {
        name: string;
        phone: string;
        supportedGender: string[];
        address: string;
    }) => void;
}

export default function EditGymInfoModal({ isOpen, onClose, gymId, initialData, onSave }: EditGymInfoModalProps) {
    const [formData, setFormData] = useState(initialData);
    const editMutation = useEditGymCommonData();

    useEffect(() => {
        setFormData(initialData);
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleClear = (field: 'name' | 'phone' | 'address') => {
        setFormData(prev => ({ ...prev, [field]: '' }));
    };

    const handleChange = (field: 'name' | 'phone' | 'address', value: string) => {
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
                    toast.success('تغییرات بخش اطلاعات باشگاه با موفقیت ثبت شد.');
                    onClose();
                },
            }
        );
    };

    const clearSuffix = (field: 'name' | 'phone' | 'address', value: string) =>
        value ? (
            <button type="button" onClick={() => handleClear(field)} className="hover:text-gray-600 p-1">
                <LuX size={16} />
            </button>
        ) : null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" dir="rtl">
            <div className="bg-white rounded-2xl w-full max-w-[500px] shadow-2xl overflow-hidden flex flex-col relative animate-[scaleIn_0.2s_ease-out] p-6 pb-8">
                <div className="relative mb-6">
                    <h3 className="text-[16px] font-bold text-gray-800 text-right pl-10">ویرایش اطلاعات باشگاه</h3>
                    <button type="button" onClick={onClose} className="absolute left-0 top-0 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                        <LuX size={20} />
                    </button>
                </div>

                <div className="flex flex-col gap-4">
                    <Input
                        label="نام باشگاه"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        suffix={clearSuffix('name', formData.name)}
                    />

                    <Input
                        label="شماره تماس"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        suffix={clearSuffix('phone', formData.phone)}
                    />

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-gray-700 text-right">جنسیت</label>
                        <div className="relative flex items-center">
                            <select
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-50 transition-all text-[14px] text-gray-800 appearance-none bg-white cursor-pointer"
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

                    <Input
                        label="آدرس"
                        value={formData.address}
                        onChange={(e) => handleChange('address', e.target.value)}
                        suffix={clearSuffix('address', formData.address)}
                    />
                </div>

                <div className="flex gap-3 mt-8">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 rounded-full text-[13px] font-bold hover:bg-gray-50 transition-colors"
                    >
                        انصراف
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={editMutation.isPending}
                        className="flex-1 py-3 bg-primary-500 text-white rounded-full text-[13px] font-bold hover:bg-primary-600 transition-colors disabled:opacity-50"
                    >
                        {editMutation.isPending ? 'در حال ذخیره...' : 'ثبت تغییرات'}
                    </button>
                </div>
            </div>
        </div>
    );
}
