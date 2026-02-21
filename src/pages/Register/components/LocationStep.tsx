import { HiOutlineX } from 'react-icons/hi';
import type { StepProps } from '../types';
import NeshanMap from '../../../components/NeshanMap';

export default function LocationStep({ formData, updateField, clearField }: StepProps) {
    const value = formData.address;

    return (
        <div className="animate-[fadeIn_0.3s_ease-out]">
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
                <div className="mb-6">
                    <label className="block text-right text-[13px] font-semibold text-gray-900 mb-2">
                        آدرس دقیق
                    </label>
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            className="w-full px-4 py-3.5 border-[1.5px] border-gray-200 rounded-[10px] text-sm text-gray-900 bg-white transition-all duration-200 placeholder:text-gray-400 focus:border-primary-400 focus:ring-[3px] focus:ring-primary-400/10 outline-none"
                            placeholder="آدرس دقیق باشگاه را وارد کنید"
                            value={value}
                            onChange={(e) => updateField('address', e.target.value)}
                            dir="rtl"
                            style={{ textAlign: 'right' }}
                        />
                        {value && (
                            <button
                                type="button"
                                className="absolute left-3.5 text-gray-400 hover:text-red-500 transition-colors flex items-center"
                                onClick={() => clearField('address')}
                            >
                                <HiOutlineX size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
