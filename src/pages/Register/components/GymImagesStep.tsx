import { useRef, type ChangeEvent } from 'react';
import { HiOutlinePhotograph, HiOutlineX } from 'react-icons/hi';
import type { StepProps } from '../types';

interface GymImagesStepProps extends StepProps {
    handleImageUpload: (e: ChangeEvent<HTMLInputElement>) => void;
    removeImage: (i: number) => void;
}

export default function GymImagesStep({ formData, handleImageUpload, removeImage }: GymImagesStepProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="animate-[fadeIn_0.3s_ease-out]">
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
        </div>
    );
}
