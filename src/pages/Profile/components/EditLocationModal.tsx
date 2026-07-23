import { useState, useEffect } from 'react';
import { LuX } from 'react-icons/lu';
import { toast } from 'react-toastify';
import NeshanMap from '../../../components/NeshanMap';
import { useEditGymGeoLocation } from '../../../hooks/useGym';

interface EditLocationModalProps {
    isOpen: boolean;
    onClose: () => void;
    gymId: string;
    initialLocation?: { lat: number; lng: number };
    onSave: (location: { lat: number; lng: number }) => void;
}

export default function EditLocationModal({ isOpen, onClose, gymId, initialLocation, onSave }: EditLocationModalProps) {
    const [location, setLocation] = useState({ lat: 35.6892, lng: 51.389 });
    const editMutation = useEditGymGeoLocation();

    useEffect(() => {
        if (isOpen && initialLocation) {
            setLocation(initialLocation);
        }
    }, [isOpen, initialLocation]);

    if (!isOpen) return null;

    const handleSave = () => {
        editMutation.mutate(
            {
                gymId,
                geoLocation: {
                    latitude: location.lat,
                    longitude: location.lng,
                },
            },
            {
                onSuccess: () => {
                    onSave(location);
                    toast.success('تغییرات بخش موقعیت مکانی باشگاه با موفقیت ثبت شد.');
                    onClose();
                },
            }
        );
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" dir="rtl">
            <div className="bg-white rounded-2xl w-full max-w-[500px] shadow-2xl overflow-hidden flex flex-col relative animate-[scaleIn_0.2s_ease-out] p-6 pb-8">
                <div className="relative mb-6">
                    <h3 className="text-[16px] font-bold text-gray-800 text-right pl-10">ویرایش موقعیت مکانی باشگاه</h3>
                    <button type="button" onClick={onClose} className="absolute left-0 top-0 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                        <LuX size={20} />
                    </button>
                </div>

                <div className="w-full h-[350px] md:h-[400px] bg-gray-100 relative overflow-hidden rounded-xl border border-gray-100">
                    <NeshanMap
                        hideSearch
                        hideCoordinates
                        markerColor="primary"
                        latitude={location.lat}
                        longitude={location.lng}
                        onLocationChange={(lat, lng) => setLocation({ lat, lng })}
                        height="100%"
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
