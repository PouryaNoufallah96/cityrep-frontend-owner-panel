import { useRef, type ChangeEvent } from 'react';
import { HiOutlineX, HiPlus } from 'react-icons/hi';
import type { StepProps } from '../types';

interface GymImagesStepProps extends StepProps {
    handleImageUpload: (e: ChangeEvent<HTMLInputElement>) => void;
    removeImage: (i: number) => void;
}

export default function GymImagesStep({ formData, handleImageUpload, removeImage }: GymImagesStepProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="bg-[#F9F9F9] rounded-2xl p-5 min-h-[300px] animate-[fadeIn_0.3s_ease-out]">
            <button
                type="button"
                className="w-full h-[64px] border border-dashed border-[#D0D0D0] rounded-xl flex items-center justify-center gap-2.5 text-gray-500 bg-white hover:border-[#3C25C9]/40 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
            >
                <span className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center shrink-0">
                    <HiPlus size={16} className="text-gray-400" />
                </span>
                <span className="text-sm font-medium text-gray-600">تصویر باشگاه</span>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                />
            </button>

            {formData.images.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-4 max-sm:grid-cols-2">
                    {formData.images.map((img, index) => (
                        <div key={index} className="relative aspect-[4/3] rounded-[10px] overflow-hidden group bg-white">
                            <img src={img.url} alt="" className="w-full h-full object-cover" />
                            <button
                                type="button"
                                className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/45 text-white flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeImage(index)}
                                aria-label="حذف تصویر"
                            >
                                <HiOutlineX size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
