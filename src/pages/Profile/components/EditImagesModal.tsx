import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { LuX, LuPlus, LuTrash2, LuLoader } from 'react-icons/lu';
import { toast } from 'react-toastify';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { fileService } from '../../../services/fileService';
import { useEditGymImages } from '../../../hooks/useGym';

interface EditImagesModalProps {
    isOpen: boolean;
    onClose: () => void;
    gymId: string;
    images: string[];
    onSave: (images: string[]) => void;
}

export default function EditImagesModal({ isOpen, onClose, gymId, images: initialImages, onSave }: EditImagesModalProps) {
    const [images, setImages] = useState<string[]>([]);
    const [imageToDelete, setImageToDelete] = useState<number | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const editMutation = useEditGymImages();

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
            toast.success('حذف تصویر باشگاه با موفقیت انجام شد.');
        }
    };

    const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        try {
            const uploadedUrls: string[] = [];
            for (let i = 0; i < files.length; i++) {
                const fileName = await fileService.uploadFile(files[i], 'profile');
                uploadedUrls.push(fileService.getFileUrl(fileName));
                toast.success('افزودن تصویر باشگاه با موفقیت انجام شد.');
            }
            setImages(prev => [...prev, ...uploadedUrls]);
        } catch {
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const extractFileName = (url: string) => {
        const parts = url.split('/DownloadFile/');
        return parts.length > 1 ? parts[1] : url;
    };

    const handleSave = () => {
        const payload = {
            gymId,
            images: images.map((img, index) => ({
                imageUrl: extractFileName(img),
                order: index,
            })),
        };

        editMutation.mutate(payload, {
            onSuccess: () => {
                onSave(images);
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" dir="rtl">
            <div className="bg-white rounded-2xl w-full max-w-[500px] shadow-2xl overflow-hidden flex flex-col relative animate-[scaleIn_0.2s_ease-out] p-6 pb-8">
                <div className="relative mb-6">
                    <h3 className="text-[16px] font-bold text-gray-800 text-right pl-10">ویرایش تصویر باشگاه</h3>
                    <button type="button" onClick={onClose} className="absolute left-0 top-0 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                        <LuX size={20} />
                    </button>
                </div>

                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full h-[60px] border border-dashed border-gray-300 rounded-xl flex items-center justify-center gap-2.5 text-gray-600 hover:bg-gray-50 transition-colors mb-6 cursor-pointer outline-none disabled:opacity-50 disabled:cursor-wait bg-white"
                >
                    {isUploading ? (
                        <>
                            <LuLoader size={18} className="text-primary-500 animate-spin" />
                            <span className="text-[14px] font-medium">در حال آپلود...</span>
                        </>
                    ) : (
                        <>
                            <span className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-400 shrink-0">
                                <LuPlus size={14} />
                            </span>
                            <span className="text-[14px] font-medium text-gray-600">تصویر باشگاه</span>
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

                <div className="grid grid-cols-2 gap-4 max-h-[300px] overflow-y-auto custom-scrollbar pb-2">
                    {images.map((img, index) => (
                        <div key={index} className="relative aspect-[4/3] rounded-xl overflow-hidden">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/30 pointer-events-none" />
                            <button
                                type="button"
                                onClick={() => handleDelete(index)}
                                className="absolute bottom-2.5 right-2.5 w-9 h-9 rounded-full bg-white/90 text-gray-700 flex items-center justify-center hover:bg-white transition-colors z-10 shadow-sm"
                                aria-label="حذف تصویر"
                            >
                                <LuTrash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="flex gap-3 mt-8">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 rounded-full text-[13px] font-bold hover:bg-gray-50 transition-colors"
                    >
                        انصراف
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={editMutation.isPending}
                        className="flex-1 py-3 bg-primary-500 text-white rounded-full text-[13px] font-bold hover:bg-primary-600 transition-colors disabled:opacity-50"
                    >
                        {editMutation.isPending ? 'در حال ذخیره...' : 'ثبت تغییرات'}
                    </button>
                </div>
            </div>

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
