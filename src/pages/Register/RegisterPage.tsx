import { useState, useRef, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    HiOutlineArrowLeft,
    HiOutlineArrowRight,
    HiOutlinePhotograph,
    HiOutlineLocationMarker,
    HiOutlineX,
} from 'react-icons/hi';
import { BsGrid, BsPerson } from 'react-icons/bs';
import { IoDocumentTextOutline } from 'react-icons/io5';
import { useAddGym } from '../../hooks/useGym';
import { useGymTrends } from '../../hooks/useGym';
import { fileService } from '../../services/fileService';
import type { AddGymPayload } from '../../services/gymService';
import NeshanMap from '../../components/NeshanMap';
import Sidebar from '../../components/layout/Sidebar';

interface GymFormData {
    title: string;
    phoneNumber: string;
    supportedGender: string;
    address: string;
    description: string;
    selectedTrends: string[];
    latitude: number | null;
    longitude: number | null;
    images: { file?: File; url: string; order: number }[];
}

const STEPS = [
    { id: 0, label: 'اطلاعات باشگاه', icon: IoDocumentTextOutline },
    { id: 1, label: 'رشته های ورزشی', icon: BsGrid },
    { id: 2, label: 'لوکیشن', icon: HiOutlineLocationMarker },
    { id: 3, label: 'تصاویر باشگاه', icon: HiOutlinePhotograph },
];



const SPORT_TRENDS_FALLBACK = [
    { gymTrendId: '1', title: 'فیتنس', iconUrl: '🏋️' },
    { gymTrendId: '2', title: 'بدنسازی', iconUrl: '💪' },
    { gymTrendId: '3', title: 'پیلاتس', iconUrl: '🧘' },
    { gymTrendId: '4', title: 'پیلاتس ریفرمر', iconUrl: '🤸' },
    { gymTrendId: '5', title: 'آمادگی جسمانی', iconUrl: '🏃' },
    { gymTrendId: '6', title: 'ایریال یوگا', iconUrl: '🧘‍♀️' },
    { gymTrendId: '7', title: 'یوگا', iconUrl: '⚡' },
    { gymTrendId: '8', title: 'آکرو یوگا', iconUrl: '⚡' },
    { gymTrendId: '9', title: 'تمرینات قدرتی', iconUrl: '🏋️‍♂️' },
    { gymTrendId: '10', title: 'کششی', iconUrl: '🤸‍♂️' },
    { gymTrendId: '11', title: 'کراس فیت', iconUrl: '🏅' },
];

export default function RegisterPage() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<GymFormData>({
        title: '',
        phoneNumber: '',
        supportedGender: '',
        address: '',
        description: '',
        selectedTrends: [],
        latitude: null,
        longitude: null,
        images: [],
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const addGymMutation = useAddGym();
    const { data: trendsData } = useGymTrends();

    const trends = trendsData?.data?.length ? trendsData.data : SPORT_TRENDS_FALLBACK;

    const updateField = <K extends keyof GymFormData>(field: K, value: GymFormData[K]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const clearField = (field: keyof GymFormData) => {
        setFormData((prev) => ({ ...prev, [field]: '' }));
    };

    const toggleTrend = (trendId: string) => {
        setFormData((prev) => ({
            ...prev,
            selectedTrends: prev.selectedTrends.includes(trendId)
                ? prev.selectedTrends.filter((id) => id !== trendId)
                : [...prev.selectedTrends, trendId],
        }));
    };

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newImages = Array.from(files).map((file, i) => ({
            file,
            url: URL.createObjectURL(file),
            order: formData.images.length + i,
        }));
        updateField('images', [...formData.images, ...newImages]);
    };

    const removeImage = (index: number) => {
        updateField(
            'images',
            formData.images.filter((_, i) => i !== index)
        );
    };

    const handleNext = () => {
        if (currentStep === 0) {
            if (!formData.title) {
                toast.error('لطفا نام باشگاه را وارد کنید');
                return;
            }
        }
        if (currentStep < STEPS.length - 1) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const handleSubmit = async () => {
        try {
            // Upload images first
            const uploadedImages = await Promise.all(
                formData.images
                    .filter((img) => img.file)
                    .map(async (img, i) => {
                        console.log(img.file)
                        const fileName = await fileService.uploadFile(img.file!, "1234");
                        return { imageUrl: fileName, order: i };
                    })
            );

            const payload: AddGymPayload = {
                title: formData.title,
                description: formData.description,
                address: {
                    address: formData.address,
                    ...(formData.latitude && formData.longitude
                        ? { geoLocation: { latitude: formData.latitude, longitude: formData.longitude } }
                        : {}),
                },
                contact: {
                    phoneNumber: formData.phoneNumber,
                },
                trends: formData.selectedTrends.map((id) => ({ gymTrendId: id })),
                images: uploadedImages,
            };

            addGymMutation.mutate(payload, {
                onSuccess: () => {
                    toast.success('باشگاه با موفقیت ثبت شد');
                    navigate('/dashboard');
                },
                onError: (error: any) => {
                    toast.error(error.response?.data?.message || 'خطا در ثبت باشگاه');
                },
            });
        } catch {
            toast.error('خطا در آپلود تصاویر');
        }
    };

    const isSubmitting = addGymMutation.isPending;

    // Input with clear button helper
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
                        onChange={(e) => updateField(field, e.target.value as any)}
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
        <div className="flex min-h-screen" dir="rtl">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col bg-gray-50">
                {/* Top Bar */}
                <header className="flex items-center justify-end px-8 py-4 bg-white border-b border-gray-200 gap-3">
                    <div className="flex items-center gap-2 text-[13px] text-gray-500">
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        حساب کاربری
                    </div>
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                        <BsPerson size={18} />
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 p-10 flex justify-center max-sm:p-5">
                    <div className="w-full max-w-[650px] bg-white rounded-2xl p-10 shadow-sm animate-[fadeIn_0.4s_ease-out] max-sm:p-6">
                        {/* Title */}
                        <h1 className="text-center text-lg font-bold text-gray-900 mb-2">
                            ثبت نام باشگاه
                        </h1>
                        <p className="text-center text-[13px] text-gray-500 mb-9">
                            لطفا جهت ثبت نام اطلاعات خواسته شده را وارد کنید.
                        </p>

                        {/* Stepper */}
                        <div className="flex items-center justify-center mb-10">
                            {STEPS.map((stepItem, index) => (
                                <div key={stepItem.id} className="flex items-center">
                                    <div className="flex flex-col items-center gap-2.5 min-w-[100px] max-sm:min-w-[70px] z-[1]">
                                        <div
                                            className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all duration-250 border-2
                        ${currentStep === index
                                                    ? 'border-primary-500 bg-primary-500 text-white shadow-[0_4px_12px_rgba(124,77,255,0.3)]'
                                                    : currentStep > index
                                                        ? 'border-primary-300 bg-primary-50 text-primary-500'
                                                        : 'border-gray-200 bg-white text-gray-400'
                                                }`}
                                        >
                                            <stepItem.icon />
                                        </div>
                                        <span
                                            className={`text-xs font-medium whitespace-nowrap max-sm:text-[10px]
                        ${currentStep === index
                                                    ? 'text-primary-600 font-semibold'
                                                    : currentStep > index
                                                        ? 'text-primary-400'
                                                        : 'text-gray-400'
                                                }`}
                                        >
                                            {stepItem.label}
                                        </span>
                                    </div>
                                    {index < STEPS.length - 1 && (
                                        <div
                                            className={`w-[60px] max-sm:w-[30px] h-0.5 mb-7 border-t-2 border-dashed
                        ${currentStep > index ? 'border-primary-300' : 'border-gray-300'}`}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Step Content */}
                        <div className="animate-[fadeIn_0.3s_ease-out]" key={currentStep}>
                            {currentStep === 0 && (
                                <>
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
                                </>
                            )}

                            {currentStep === 1 && (
                                <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
                                    {trends.map((trend: any) => {
                                        const selected = formData.selectedTrends.includes(trend.gymTrendId);
                                        return (
                                            <button
                                                key={trend.gymTrendId}
                                                type="button"
                                                onClick={() => toggleTrend(trend.gymTrendId)}
                                                className={`flex items-center gap-2.5 px-4 py-3.5 border-[1.5px] rounded-[10px] cursor-pointer transition-all duration-200 flex-row-reverse justify-between
                          ${selected
                                                        ? 'border-primary-400 bg-primary-50'
                                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="text-base">{trend.iconUrl || '🏋️'}</span>
                                                    <span className="text-[13px] font-medium text-gray-900">{trend.title}</span>
                                                </div>
                                                <div
                                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0
                            ${selected
                                                            ? 'border-primary-500 bg-primary-500'
                                                            : 'border-gray-300'
                                                        }`}
                                                >
                                                    {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {currentStep === 2 && (
                                <>
                                    <NeshanMap
                                        latitude={formData.latitude ?? 35.6892}
                                        longitude={formData.longitude ?? 51.389}
                                        onLocationChange={(lat, lng) => {
                                            updateField('latitude', lat);
                                            updateField('longitude', lng);
                                        }}
                                        height="300px"
                                    />
                                    <div className="mt-4">
                                        {renderInput('address', 'آدرس دقیق', 'آدرس دقیق باشگاه را وارد کنید')}
                                    </div>
                                </>
                            )}

                            {currentStep === 3 && (
                                <>
                                    <div
                                        className="border-2 border-dashed border-gray-300 rounded-[10px] p-10 text-center cursor-pointer transition-all duration-200 mb-5 hover:border-primary-400 hover:bg-primary-50"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <HiOutlinePhotograph className="text-[40px] text-gray-300 mx-auto mb-3" />
                                        <p className="text-sm text-gray-500">برای آپلود تصاویر کلیک کنید</p>
                                        <p className="text-xs text-gray-400 mt-1">PNG, JPG تا ۵ مگابایت</p>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                            onChange={handleImageUpload}
                                        />
                                    </div>

                                    {formData.images.length > 0 && (
                                        <div className="grid grid-cols-4 gap-3 max-sm:grid-cols-3">
                                            {formData.images.map((img, index) => (
                                                <div key={index} className="relative aspect-square rounded-[10px] overflow-hidden border border-gray-200">
                                                    <img src={img.url} alt={`Upload ${index}`} className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full bg-red-500/90 text-white flex items-center justify-center text-sm cursor-pointer transition-transform hover:scale-110 hover:bg-red-500"
                                                        onClick={() => removeImage(index)}
                                                    >
                                                        <HiOutlineX size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between mt-9 gap-4">
                            <button
                                type="button"
                                onClick={currentStep === STEPS.length - 1 ? handleSubmit : handleNext}
                                disabled={isSubmitting}
                                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-br from-primary-400 to-primary-500 text-white rounded-[10px] text-sm font-semibold cursor-pointer transition-all duration-250 hover:from-primary-500 hover:to-primary-600 hover:shadow-[0_4px_15px_rgba(124,77,255,0.35)] hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
                            >
                                {isSubmitting ? (
                                    <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        {currentStep === STEPS.length - 1 ? 'ثبت باشگاه' : 'بعدی'}
                                        <HiOutlineArrowLeft />
                                    </>
                                )}
                            </button>

                            {currentStep > 0 && (
                                <button
                                    type="button"
                                    onClick={handlePrevious}
                                    className="flex items-center gap-2 px-6 py-3 bg-transparent text-gray-500 border-[1.5px] border-gray-300 rounded-[10px] text-sm font-medium cursor-pointer transition-all duration-200 hover:border-gray-400 hover:text-gray-900 hover:bg-gray-50"
                                >
                                    <HiOutlineArrowRight />
                                    قبلی
                                </button>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
