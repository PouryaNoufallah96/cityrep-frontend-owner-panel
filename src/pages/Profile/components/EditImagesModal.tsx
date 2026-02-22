import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { LuX, LuPlus, LuTrash2, LuLoader } from 'react-icons/lu';
import { toast } from 'react-toastify';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { fileService } from '../../../services/fileService';

interface EditImagesModalProps {
    isOpen: boolean;
    onClose: () => void;
    images: string[];
    onSave: (images: string[]) => void;
}

export default function EditImagesModal({ isOpen, onClose, images: initialImages, onSave }: EditImagesModalProps) {
    const [images, setImages] = useState<string[]>([]);
    const [imageToDelete, setImageToDelete] = useState<number | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setImages(initialImages);
        }
    }, [isOpen, initialImages]);

    if (!isOpen) return null;

    const handleDelete = (index: number) => {
        setImageToDelete(index);
    };

    const confirmDelete = () => {
        if (imageToDelete !== null) {
            setImages(prev => prev.filter((_, i) => i !== imageToDelete));
            setImageToDelete(null);
        }
    };

    const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        try {
            const uploadedUrls: string[] = [];
            for (let i = 0; i < files.length; i++) {
                const fileName = await fileService.uploadFile(files[i], "profile");
                uploadedUrls.push(fileService.getFileUrl(fileName));
            }
            setImages(prev => [...prev, ...uploadedUrls]);
            toast.success('تصاویر با موفقیت آپلود شدند');
        } catch (error) {
            toast.error('خطا در آپلود تصاویر');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" dir="rtl">
            <div className="bg-white rounded-2xl w-full max-w-[500px] shadow-2xl overflow-hidden flex flex-col relative animate-[scaleIn_0.2s_ease-out] p-6 pb-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex-1 flex justify-center">
                        <h3 className="text-[16px] font-bold text-gray-800">ویرایش تصویر باشگاه</h3>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors absolute left-4 top-4">
                        <LuX size={20} />
                    </button>
                </div>

                {/* Add Image Button */}
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full h-[60px] border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-3 text-gray-600 hover:bg-gray-50 transition-colors mb-6 cursor-pointer outline-none disabled:opacity-50 disabled:cursor-wait"
                >
                    {isUploading ? (
                        <>
                            <span className="text-[14px] font-medium font-bold">در حال آپلود...</span>
                            <div className="text-primary-500 animate-spin">
                                <LuLoader size={18} />
                            </div>
                        </>
                    ) : (
                        <>
                            <span className="text-[14px] font-medium font-bold">تصویر باشگاه</span>
                            <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-400">
                                <LuPlus size={14} />
                            </div>
                        </>
                    )}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                />

                {/* Images Grid */}
                <div className="grid grid-cols-2 gap-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-1 pb-2">
                    {images.map((img, index) => (
                        <div key={index} className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-sm group">
                            <img src={img} alt={`Gym ${index}`} className="w-full h-full object-cover" />
                            {/* Gradient Overlay */}
                            <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-gray-900/80 to-transparent pointer-events-none"></div>

                            {/* Trash Icon */}
                            <button
                                onClick={() => handleDelete(index)}
                                className="absolute bottom-3 right-3 text-white hover:text-red-400 p-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-md transition-all z-10"
                            >
                                <LuTrash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-4 mt-8">
                    <button
                        onClick={() => {
                            onSave(images);
                            onClose();
                        }}
                        className="flex-1 h-[48px] bg-primary-600 text-white rounded-[12px] text-[14px] font-bold hover:bg-primary-700 transition-colors"
                    >
                        ثبت تغییرات
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 h-[48px] bg-white border-2 border-gray-200 text-gray-700 rounded-[12px] text-[14px] font-bold hover:bg-gray-50 transition-colors"
                    >
                        انصراف
                    </button>
                </div>
            </div>

            {/* Nested Confirmation Modal */}
            <ConfirmModal
                isOpen={imageToDelete !== null}
                onClose={() => setImageToDelete(null)}
                onConfirm={confirmDelete}
                title="حذف تصویر باشگاه"
                subtitle="آیا از حذف عکس مورد نظر مطمئن هستید؟"
                confirmText="حذف"
                cancelText="انصراف"
                isDestructive={true}
            />
        </div>
    );
}
