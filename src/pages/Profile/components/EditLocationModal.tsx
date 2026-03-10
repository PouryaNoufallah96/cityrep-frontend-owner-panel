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
                    toast.success('موقعیت مکانی با موفقیت ویرایش شد');
                    onClose();
                },
                onError: (error: any) => {
                    toast.error(error.response?.data?.message || 'خطا در ویرایش موقعیت مکانی');
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
                        <h3 className="text-[16px] font-bold text-gray-800">ویرایش موقعیت مکانی باشگاه</h3>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors absolute left-4 top-4">
                        <LuX size={20} />
                    </button>
                </div>

                {/* Map Container */}
                <div className="w-full h-[350px] md:h-[400px] bg-gray-100 relative overflow-hidden flex flex-col">
                    <div className="absolute inset-0 z-0">
                        <NeshanMap
                            hideCoordinates
                            latitude={location.lat}
                            longitude={location.lng}
                            onLocationChange={(lat, lng) => setLocation({ lat, lng })}
                            height="100%"
                        />
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
