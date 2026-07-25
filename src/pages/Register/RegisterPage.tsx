import { useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    HiOutlineArrowLeft,
    HiOutlineArrowRight,
    HiOutlinePhotograph,
    HiOutlineLocationMarker,
    HiOutlineOfficeBuilding,
} from 'react-icons/hi';
import { BsGrid } from 'react-icons/bs';

import { useAddGym, useGymTrends } from '../../hooks/useGym';
import { useAuth } from '../../context/AuthContext';
import { fileService } from '../../services/fileService';
import type { AddGymPayload } from '../../services/gymService';
import Sidebar from '../../components/layout/Sidebar';
import PageHeader from '../../components/layout/PageHeader';

import type { GymFormData } from './types';
import RegisterStepper from './components/RegisterStepper';
import GymInfoStep from './components/GymInfoStep';
import SportTrendsStep from './components/SportTrendsStep';
import LocationStep from './components/LocationStep';
import GymImagesStep from './components/GymImagesStep';
import RegisterSuccess from './components/RegisterSuccess';

const STEPS = [
    { id: 0, label: 'اطلاعات باشگاه', icon: HiOutlineOfficeBuilding },
    { id: 1, label: 'رشته های ورزشی', icon: BsGrid },
    { id: 2, label: 'لوکیشن', icon: HiOutlineLocationMarker },
    { id: 3, label: 'تصاویر باشگاه', icon: HiOutlinePhotograph },
];

const SPORT_TRENDS_FALLBACK = [
    { gymTrendId: '1', title: 'فیتنس' },
    { gymTrendId: '2', title: 'بدنسازی' },
    { gymTrendId: '3', title: 'پیلاتس' },
    { gymTrendId: '4', title: 'پیلاتس ریفرمر' },
    { gymTrendId: '5', title: 'آمادگی جسمانی' },
    { gymTrendId: '6', title: 'ایریال یوگا' },
    { gymTrendId: '8', title: 'آکرو یوگا' },
    { gymTrendId: '7', title: 'یوگا' },
    { gymTrendId: '10', title: 'کششی' },
    { gymTrendId: '9', title: 'تمرینات قدرتی' },
    { gymTrendId: '11', title: 'کراس فیت' },
];

export default function RegisterPage() {
    const navigate = useNavigate();
    const { setHasGym, recheckGyms } = useAuth();
    const [currentStep, setCurrentStep] = useState(0);
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState<GymFormData>({
        title: '',
        phoneNumber: '',
        supportedGender: '',
        address: '',
        description: '',
        selectedTrends: [],
        latitude: 35.6892,
        longitude: 51.389,
        images: [],
    });

    const addGymMutation = useAddGym();
    const { data: trendsResponse } = useGymTrends();
    const trendsData = Array.isArray(trendsResponse) ? trendsResponse : (trendsResponse?.data || []);
    const trends = trendsData?.length
        ? trendsData.map((t: any) => ({
            ...t,
            iconUrl: t.iconUrl ? `${import.meta.env.VITE_BASE_API}/File/DownloadFile/${t.iconUrl}` : t.iconUrl,
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
                onSuccess: () => {
                    setIsSuccess(true);
                },
                onError: (error: any) => {
                    toast.error(error.response?.data?.message || 'خطا در ثبت باشگاه');
                },
            });
        } catch {
            toast.error('خطا در آپلود تصاویر');
        }
    };

    const handleGoToSchedule = () => {
        setHasGym(null);
        navigate('/schedule');
        recheckGyms();
    };

    const isSubmitting = addGymMutation.isPending;

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
        <div className="flex min-h-screen bg-gray-50" dir="rtl">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0">
                <main className="flex-1 p-6 max-sm:p-4 overflow-y-auto">
                    <div className="max-w-[1200px] mx-auto flex flex-col gap-4">
                        <PageHeader title="حساب کاربری" />

                        <div className="w-full bg-white rounded-2xl px-10 py-8 max-sm:px-5 max-sm:py-6 border border-gray-100 min-h-[calc(100vh-180px)] flex flex-col">
                            {isSuccess ? (
                                <RegisterSuccess onSchedule={handleGoToSchedule} />
                            ) : (
                                <>
                                    <h1 className="text-center text-[17px] font-bold text-gray-900 mb-1.5">ثبت نام باشگاه</h1>
                                    <p className="text-center text-[13px] text-gray-500 mb-8">لطفا جهت ثبت نام اطلاعات خواسته شده را وارد کنید.</p>

                                    <RegisterStepper steps={STEPS} currentStep={currentStep} />

                                    <div className="flex-1">
                                        {renderStepContent()}
                                    </div>

                                    <div className="flex items-center justify-between mt-8 gap-4">
                                        {currentStep > 0 ? (
                                            <button
                                                type="button"
                                                onClick={handlePrevious}
                                                className="flex items-center gap-2 h-11 px-6 bg-white text-gray-500 border border-[#D0D0D0] rounded-full text-sm font-medium cursor-pointer transition-colors hover:border-gray-400 hover:text-gray-800"
                                            >
                                                <HiOutlineArrowRight size={18} />
                                                قبلی
                                            </button>
                                        ) : (
                                            <span />
                                        )}

                                        <button
                                            type="button"
                                            onClick={currentStep === STEPS.length - 1 ? handleSubmit : handleNext}
                                            disabled={isSubmitting}
                                            className="flex items-center gap-2 h-11 px-8 bg-[#3C25C9] text-white rounded-full text-sm font-semibold cursor-pointer transition-colors hover:bg-[#3220A8] disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? (
                                                <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    بعدی
                                                    <HiOutlineArrowLeft size={18} />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
