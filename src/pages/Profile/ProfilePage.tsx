import { useState, useEffect } from 'react';

import { LuPen, LuBuilding2, LuPhone, LuMapPin, LuUser, LuPlus, LuEllipsis, LuMaximize2 } from 'react-icons/lu';
import Sidebar from '../../components/layout/Sidebar';
import PageHeader from '../../components/layout/PageHeader';
import NeshanMap from '../../components/NeshanMap';
import EditGymInfoModal from './components/EditGymInfoModal';
import EditLocationModal from './components/EditLocationModal';
import EditImagesModal from './components/EditImagesModal';

import { useGyms, useToggleGymActivityTrend } from '../../hooks/useGym';
import { fileService } from '../../services/fileService';
import { toPersianDigits } from '../../utils/format';

const cardClass = 'bg-white rounded-2xl border border-gray-100 p-6';
const editBtnClass =
    'w-9 h-9 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors shrink-0';
const infoIconClass =
    'w-11 h-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0';

function displayGymName(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return '—';
    return trimmed.startsWith('باشگاه') ? trimmed : `باشگاه ${trimmed}`;
}

export default function ProfilePage() {
    const { data: gymsResponse, isPending, isError } = useGyms();
    const gym = gymsResponse?.data?.data?.[0];
    const gymId = gym?.gymId ?? '';

    const [sportsStatus, setSportsStatus] = useState<{ id: string | number, name: string, isActive: boolean }[]>([]);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [isImagesModalOpen, setIsImagesModalOpen] = useState(false);
    const [gymImages, setGymImages] = useState<string[]>([]);
    const [gymLocation, setGymLocation] = useState({ lat: 35.6892, lng: 51.389 });
    const [gymInfo, setGymInfo] = useState<{
        name: string;
        phone: string;
        supportedGender: string[];
        address: string;
    }>({
        name: '',
        phone: '',
        supportedGender: [],
        address: '',
    });

    useEffect(() => {
        if (!gym) return;

        setSportsStatus(
            (gym.trends || []).map((t) => ({ id: t.gymTrendId, name: t.title, isActive: t.isActive }))
        );

        setGymImages(
            (gym.images || []).map((img: { imageUrl?: string } | string) =>
                fileService.getFileUrl(typeof img === 'string' ? img : (img.imageUrl || ''))
            )
        );

        if (gym.address?.geoLocation) {
            setGymLocation({
                lat: gym.address.geoLocation.latitude,
                lng: gym.address.geoLocation.longitude,
            });
        }

        setGymInfo({
            name: gym.title || '',
            phone: gym.contact?.phoneNumber || '',
            supportedGender: gym.supportedGender || [],
            address: gym.address?.address || '',
        });
    }, [gym]);

    const getGenderLabel = (genders: string[]) => {
        if (genders.includes('Male') && genders.includes('Female')) return 'آقایان و بانوان';
        if (genders.includes('Male')) return 'آقایان';
        if (genders.includes('Female')) return 'بانوان';
        return '—';
    };

    const toggleGymActivityTrendMutation = useToggleGymActivityTrend();

    const toggleSport = (id: string | number) => {
        if (!gym?.gymId) return;

        setSportsStatus(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));

        toggleGymActivityTrendMutation.mutate(
            { gymId: gym.gymId, gymTrendId: String(id) },
            {
                onError: () => {
                    setSportsStatus(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
                },
            }
        );
    };

    const openInfoModal = () => { if (gymId) setIsInfoModalOpen(true); };
    const openLocationModal = () => { if (gymId) setIsLocationModalOpen(true); };
    const openImagesModal = () => { if (gymId) setIsImagesModalOpen(true); };

    if (isPending) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <span className="inline-block w-8 h-8 border-[3px] border-primary-200 border-t-primary-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 text-[14px] font-medium text-gray-500">
                خطا در دریافت اطلاعات
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex" dir="rtl">
            <Sidebar />

            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <main className="flex-1 overflow-y-auto p-8 max-sm:p-4 bg-gray-50/50">
                    <div className="max-w-[1200px] mx-auto flex flex-col gap-5">

                        <PageHeader title="حساب کاربری" />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            <div className={`${cardClass} flex flex-col`}>
                                <div className="flex items-center justify-between mb-5">
                                    <h2 className="text-[15px] font-bold text-gray-800">تصویر باشگاه</h2>
                                    <button type="button" onClick={openImagesModal} className={editBtnClass}>
                                        <LuPen size={16} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    {gymImages.slice(0, 3).map((img, index, arr) => (
                                        <div
                                            key={index}
                                            onClick={openImagesModal}
                                            className="aspect-square rounded-xl overflow-hidden relative cursor-pointer bg-gray-100"
                                        >
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                            {gymImages.length > 3 && index === arr.length - 1 && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                                    <div className="w-9 h-9 rounded-full bg-black/50 flex items-center justify-center text-white">
                                                        <LuEllipsis size={20} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {Array.from({ length: Math.max(0, 3 - gymImages.length) }).map((_, i) => (
                                        <div
                                            key={`empty-${i}`}
                                            onClick={openImagesModal}
                                            className="aspect-square rounded-xl bg-[#FAFAFA] border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50 transition-colors"
                                        >
                                            <LuPlus size={22} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={`${cardClass} flex flex-col`}>
                                <div className="flex items-center justify-between mb-5">
                                    <h2 className="text-[15px] font-bold text-gray-800">موقعیت مکانی باشگاه</h2>
                                    <button type="button" onClick={openLocationModal} className={editBtnClass}>
                                        <LuPen size={16} />
                                    </button>
                                </div>
                                <div
                                    className="flex-1 min-h-[168px] rounded-xl bg-gray-100 relative overflow-hidden cursor-pointer"
                                    onClick={openLocationModal}
                                >
                                    <div className="absolute inset-0 z-0">
                                        <NeshanMap
                                            latitude={gymLocation.lat}
                                            longitude={gymLocation.lng}
                                            onLocationChange={() => { }}
                                            height="100%"
                                            readOnly
                                            hideSearch
                                            hideCoordinates
                                            markerColor="primary"
                                        />
                                    </div>
                                    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                                        <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 text-gray-600 flex items-center justify-center">
                                            <LuMaximize2 size={16} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={`${cardClass} flex items-center gap-4`}>
                            <div className="flex items-center gap-6 lg:gap-8 flex-wrap flex-1 min-w-0">
                                <div className="flex items-center gap-3 shrink-0">
                                    <div className={infoIconClass}>
                                        <LuBuilding2 size={20} />
                                    </div>
                                    <span className="text-[14px] font-medium text-gray-800 whitespace-nowrap">
                                        {displayGymName(gymInfo.name)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <div className={infoIconClass}>
                                        <LuUser size={20} />
                                    </div>
                                    <span className="text-[14px] font-medium text-gray-800 whitespace-nowrap">
                                        مخصوص {getGenderLabel(gymInfo.supportedGender)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <div className={infoIconClass}>
                                        <LuPhone size={20} />
                                    </div>
                                    <span className="text-[14px] font-medium text-gray-800 whitespace-nowrap" dir="ltr">
                                        {toPersianDigits(gymInfo.phone || '—')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className={infoIconClass}>
                                        <LuMapPin size={20} />
                                    </div>
                                    <span className="text-[14px] font-medium text-gray-800 leading-6 line-clamp-2">
                                        {gymInfo.address || '—'}
                                    </span>
                                </div>
                            </div>

                            <button type="button" onClick={openInfoModal} className={editBtnClass}>
                                <LuPen size={16} />
                            </button>
                        </div>

                        <div className={cardClass}>
                            <h2 className="text-[15px] font-bold text-gray-800 mb-5">رشته‌های ورزشی</h2>

                            <div className="grid grid-cols-2 items-center bg-primary-50 rounded-xl px-6 py-3.5">
                                <span className="text-[13px] font-medium text-gray-600 text-right">نام رشته</span>
                                <span className="text-[13px] font-medium text-gray-600 text-center">وضعیت</span>
                            </div>

                            <div className="flex flex-col">
                                {sportsStatus.length === 0 ? (
                                    <div className="px-6 py-10 text-center text-[13px] text-gray-400">
                                        رشته‌ای ثبت نشده است
                                    </div>
                                ) : (
                                    sportsStatus.map((sport, index) => (
                                        <div
                                            key={sport.id}
                                            className={`grid grid-cols-2 items-center px-6 py-4 ${
                                                index !== sportsStatus.length - 1 ? 'border-b border-gray-200/80' : ''
                                            }`}
                                        >
                                            <span className="text-[14px] font-medium text-gray-800 text-right">
                                                {sport.name}
                                            </span>
                                            <div className="flex justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleSport(sport.id)}
                                                    disabled={toggleGymActivityTrendMutation.isPending}
                                                    className={`w-[46px] h-6 rounded-full transition-colors duration-200 ease-in-out relative ${
                                                        sport.isActive ? 'bg-primary-500' : 'bg-gray-200'
                                                    } ${toggleGymActivityTrendMutation.isPending ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                                                >
                                                    <div
                                                        className={`w-4 h-4 rounded-full bg-white shadow-sm absolute top-1 transition-all duration-200 ease-in-out ${
                                                            sport.isActive ? 'right-1' : 'right-[26px]'
                                                        }`}
                                                    />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>
                </main>
            </div>

            <EditGymInfoModal
                isOpen={isInfoModalOpen}
                onClose={() => setIsInfoModalOpen(false)}
                initialData={gymInfo}
                gymId={gymId}
                onSave={setGymInfo}
            />
            <EditLocationModal
                isOpen={isLocationModalOpen}
                onClose={() => setIsLocationModalOpen(false)}
                initialLocation={gymLocation}
                gymId={gymId}
                onSave={(loc) => setGymLocation(loc)}
            />
            <EditImagesModal
                isOpen={isImagesModalOpen}
                onClose={() => setIsImagesModalOpen(false)}
                images={gymImages}
                gymId={gymId}
                onSave={setGymImages}
            />
        </div>
    );
}
