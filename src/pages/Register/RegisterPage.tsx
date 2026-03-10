import { useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    HiOutlineArrowLeft,
    HiOutlineArrowRight,
    HiOutlinePhotograph,
    HiOutlineLocationMarker,
} from 'react-icons/hi';
import { BsGrid } from 'react-icons/bs';
import { IoDocumentTextOutline } from 'react-icons/io5';

import { useAddGym, useGymTrends } from '../../hooks/useGym';
import { useAuth } from '../../context/AuthContext';
import { fileService } from '../../services/fileService';
import type { AddGymPayload } from '../../services/gymService';
import Sidebar from '../../components/layout/Sidebar';
import PageHeader from '../../components/layout/PageHeader';

// Child components & Types
import type { GymFormData } from './types';
import RegisterStepper from './components/RegisterStepper';
import GymInfoStep from './components/GymInfoStep';
import SportTrendsStep from './components/SportTrendsStep';
import LocationStep from './components/LocationStep';
import GymImagesStep from './components/GymImagesStep';

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
    const { recheckGyms } = useAuth();
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

    const addGymMutation = useAddGym();
    const { data: trendsResponse } = useGymTrends();
    const trendsData = Array.isArray(trendsResponse) ? trendsResponse : (trendsResponse?.data || []);
    const trends = trendsData?.length
        ? trendsData.map((t: any) => ({
            ...t,
            iconUrl: t.iconUrl ? `${import.meta.env.VITE_BASE_API}/File/DownloadFile/${t.iconUrl}` : (t.iconUrl || '🏋️')
        }))
        : SPORT_TRENDS_FALLBACK;

    const updateField = <K extends keyof GymFormData>(field: K, value: GymFormData[K]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const clearField = (field: keyof GymFormData) => {
        setFormData((prev) => ({ ...prev, [field]: '' as any }));
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
                supportedGender: formData.supportedGender === 'Both'
                    ? ['Male', 'Female']
                    : formData.supportedGender ? [formData.supportedGender] : [],
            };

            addGymMutation.mutate(payload, {
                onSuccess: async () => {
                    await recheckGyms();
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

    // Mapping step indices to cleaner functional components
    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return <GymInfoStep formData={formData} updateField={updateField} clearField={clearField} />;
            case 1:
                return <SportTrendsStep formData={formData} updateField={updateField} clearField={clearField} toggleTrend={toggleTrend} trends={trends} />;
            case 2:
                return <LocationStep formData={formData} updateField={updateField} clearField={clearField} />;
            case 3:
                return <GymImagesStep formData={formData} updateField={updateField} clearField={clearField} handleImageUpload={handleImageUpload} removeImage={removeImage} />;
            default:
                return null;
        }
    };

    return (
        <div className="flex min-h-screen" dir="rtl">
            <Sidebar />

            <div className="flex-1 flex flex-col bg-gray-50">


                <main className="flex-1 p-8 max-sm:p-4 overflow-y-auto">
                    <div className="max-w-[1200px] mx-auto flex flex-col gap-6 items-center">

                        {/* Top Header Card */}
                        <PageHeader title="حساب کاربری" />

                        {/* Content Card */}
                        <div className="w-full max-w-[650px] bg-white rounded-2xl p-10 shadow-sm animate-[fadeIn_0.4s_ease-out] max-sm:p-6 mb-auto border border-gray-100 min-h-[calc(100vh-220px)]">

                            <h1 className="text-center text-lg font-bold text-gray-900 mb-2">ثبت نام باشگاه</h1>
                            <p className="text-center text-[13px] text-gray-500 mb-9">لطفا جهت ثبت نام اطلاعات خواسته شده را وارد کنید.</p>

                            <RegisterStepper steps={STEPS} currentStep={currentStep} />

                            <div className="min-h-[250px]">
                                {renderStepContent()}
                            </div>

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
                    </div>
                </main>
            </div>
        </div>
    );
}
