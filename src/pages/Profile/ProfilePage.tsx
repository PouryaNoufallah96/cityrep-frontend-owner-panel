import { useState, useEffect } from 'react';

import { LuPen, LuBuilding2, LuPhone, LuMapPin, LuUser, LuPlus } from 'react-icons/lu';
import Sidebar from '../../components/layout/Sidebar';
import PageHeader from '../../components/layout/PageHeader';
import NeshanMap from '../../components/NeshanMap';
import EditGymInfoModal from './components/EditGymInfoModal';
import EditLocationModal from './components/EditLocationModal';
import EditImagesModal from './components/EditImagesModal';

import { useGyms, useToggleGymActivityTrend } from '../../hooks/useGym';
import { fileService } from '../../services/fileService';

export default function ProfilePage() {
    const { data: gymsResponse } = useGyms();
    const gym = gymsResponse?.data?.data?.[0];

    const [sportsStatus, setSportsStatus] = useState<{ id: string | number, name: string, isActive: boolean }[]>([]);

    useEffect(() => {
        if (gym?.trends?.length && !sportsStatus.length) {
            setSportsStatus(gym.trends.map((t) => ({ id: t.gymTrendId, name: t.title, isActive: t.isActive })));
        }
    }, [gym]);

    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [isImagesModalOpen, setIsImagesModalOpen] = useState(false);

    const [gymImages, setGymImages] = useState<string[]>([]);

    useEffect(() => {
        if (gym?.images?.length && !gymImages.length) {
            setGymImages(gym.images.map((img: any) => fileService.getFileUrl(img.imageUrl || img)));
        }
    }, [gym]);

    const [gymLocation, setGymLocation] = useState({ lat: 35.6892, lng: 51.389 });

    useEffect(() => {
        if (gym?.address?.geoLocation) {
            setGymLocation({
                lat: gym.address.geoLocation.latitude,
                lng: gym.address.geoLocation.longitude,
            });
        }
    }, [gym]);

    const [gymInfo, setGymInfo] = useState<{
        name: string;
        phone: string;
        supportedGender: string[];
        address: string;
    }>({
        name: '',
        phone: '',
        supportedGender: [],
        address: ''
    });

    useEffect(() => {
        if (gym && !gymInfo.name) {
            setGymInfo({
                name: gym.title || '',
                phone: gym.contact?.phoneNumber || '',
                supportedGender: gym.supportedGender || [],
                address: gym.address?.address || '',
            });
        }
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

        // Optimistically update the state
        setSportsStatus(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));

        toggleGymActivityTrendMutation.mutate(
            { gymId: gym.gymId, gymTrendId: String(id) },
            {
                onError: () => {
                    // Revert state if error
                    setSportsStatus(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
                }
            }
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 flex" dir="rtl">
            <Sidebar />

            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <main className="flex-1 overflow-y-auto p-8 max-sm:p-4 bg-gray-50/50">
                    <div className="max-w-[1200px] mx-auto flex flex-col gap-6">

                        {/* Top Header Card */}
                        <PageHeader title="حساب کاربری" />

                        {/* Middle Cards (Location & Images) */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Gym Location Card */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-[15px] font-bold text-gray-800">موقعیت مکانی باشگاه</h2>
                                    <button onClick={() => setIsLocationModalOpen(true)} className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
                                        <LuPen size={18} />
                                    </button>
                                </div>
                                <div className="flex-1 min-h-[220px] rounded-xl bg-gray-100 relative overflow-hidden flex items-center justify-center border border-gray-200 cursor-pointer" onClick={() => setIsLocationModalOpen(true)}>
                                    <div className="absolute inset-0 z-0">
                                        <NeshanMap
                                            latitude={gymLocation.lat}
                                            longitude={gymLocation.lng}
                                            onLocationChange={() => { }}
                                            height="100%"
                                            readOnly={true}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Gym Images Card */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-[15px] font-bold text-gray-800">تصویر باشگاه</h2>
                                    <button onClick={() => setIsImagesModalOpen(true)} className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
                                        <LuPen size={18} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    {gymImages.slice(0, 3).map((img, index) => (
                                        <div key={index} onClick={() => setIsImagesModalOpen(true)} className="aspect-square rounded-xl overflow-hidden shadow-sm relative group cursor-pointer">
                                            <img src={img} alt={`Gym Image ${index}`} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="flex gap-1">
                                                    <div className="w-2 h-2 rounded-full bg-white"></div>
                                                    <div className="w-2 h-2 rounded-full bg-white"></div>
                                                    <div className="w-2 h-2 rounded-full bg-white"></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {Array.from({ length: Math.max(0, 3 - gymImages.length) }).map((_, i) => (
                                        <div key={`empty-${i}`} onClick={() => setIsImagesModalOpen(true)} className="aspect-square rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 cursor-pointer hover:bg-gray-100 transition-colors">
                                            <LuPlus size={24} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Gym Info Bar */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between w-full gap-4 flex-wrap">
                            <div className="flex items-center gap-8 flex-wrap flex-1">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                                        <LuBuilding2 size={22} />
                                    </div>
                                    <span className="text-[14px] font-bold text-gray-800">{gymInfo.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                                        <LuUser size={22} />
                                    </div>
                                    <span className="text-[14px] font-medium text-gray-700">مخصوص {getGenderLabel(gymInfo.supportedGender)}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                                        <LuPhone size={22} />
                                    </div>
                                    <span className="text-[14px] font-medium text-gray-700 font-mono mt-1" dir="ltr">{gymInfo.phone}</span>
                                </div>
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                                        <LuMapPin size={22} />
                                    </div>
                                    <span className="text-[13px] font-medium text-gray-600 leading-relaxed max-w-sm truncate">
                                        {gymInfo.address}
                                    </span>
                                </div>
                            </div>
                            <button onClick={() => setIsInfoModalOpen(true)} className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors shrink-0">
                                <LuPen size={18} />
                            </button>
                        </div>

                        {/* Sports Disciplines */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-[15px] font-bold text-gray-800 mb-6">رشته‌های ورزشی</h2>

                            <div className="w-full flex items-center justify-between bg-primary-50/50 rounded-xl px-6 py-4 mb-2">
                                <span className="text-[13px] font-medium text-gray-600">نام رشته</span>
                                <span className="text-[13px] font-medium text-gray-600 pl-4">وضعیت</span>
                            </div>

                            <div className="flex flex-col">
                                {sportsStatus.map((sport, index) => (
                                    <div key={sport.id} className={`flex items-center justify-between px-6 py-4 ${index !== sportsStatus.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                        <span className="text-[14px] font-medium text-gray-800">{sport.name}</span>

                                        {/* Custom Toggle Switch */}
                                        <button
                                            onClick={() => toggleSport(sport.id)}
                                            disabled={toggleGymActivityTrendMutation.isPending}
                                            className={`w-[46px] h-6 rounded-full transition-colors duration-200 ease-in-out relative flex items-center shadow-inner ${sport.isActive ? 'bg-primary-600' : 'bg-gray-200'} ${toggleGymActivityTrendMutation.isPending ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                                        >
                                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out absolute ${sport.isActive ? '-translate-x-[22px]' : 'translate-x-0'}`} style={{ right: '4px' }} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </main>
            </div>

            {/* Modals */}
            <EditGymInfoModal
                isOpen={isInfoModalOpen}
                onClose={() => setIsInfoModalOpen(false)}
                initialData={gymInfo}
                gymId={gym?.gymId || ''}
                onSave={setGymInfo}
            />
            <EditLocationModal
                isOpen={isLocationModalOpen}
                onClose={() => setIsLocationModalOpen(false)}
                initialLocation={gymLocation}
                gymId={gym?.gymId || ''}
                onSave={(loc) => setGymLocation(loc)}
            />
            <EditImagesModal
                isOpen={isImagesModalOpen}
                onClose={() => setIsImagesModalOpen(false)}
                images={gymImages}
                gymId={gym?.gymId || ''}
                onSave={setGymImages}
            />
        </div>
    );
}
