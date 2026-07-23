import { useState, useEffect, useRef } from 'react';
import { LuX, LuCalendar, LuClock, LuBanknote, LuCamera } from 'react-icons/lu';
import { BsPerson } from 'react-icons/bs';
import { Html5Qrcode } from 'html5-qrcode';
import { toast } from 'react-toastify';
import { useVerifyAttendance, useMarkNoShow, useAttendanceByReference } from '../../../hooks/useReservations';
import { toPersianDigits, formatToman, formatSessionTime, formatJalaliLong } from '../../../utils/format';

interface ScanQrModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type ScanStep = 'scanning' | 'result';

export default function ScanQrModal({ isOpen, onClose }: ScanQrModalProps) {
    const [step, setStep] = useState<ScanStep>('scanning');
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [reference, setReference] = useState('');
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const verifyAttendance = useVerifyAttendance();
    const markNoShow = useMarkNoShow();
    const { data: detail, isLoading: isLoadingDetail } = useAttendanceByReference(reference);
    const isActing = verifyAttendance.isPending || markNoShow.isPending;

    const stopScanner = async () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
            try {
                await scannerRef.current.stop();
                scannerRef.current.clear();
            } catch (err) {
                console.error("Failed to stop scanner", err);
            }
        }
        setIsCameraActive(false);
    };

    useEffect(() => {
        if (!isOpen || step !== 'scanning') return;

        let cancelled = false;
        const startScanner = async () => {
            try {
                scannerRef.current = new Html5Qrcode("qr-reader");
                await scannerRef.current.start(
                    { facingMode: "environment" },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0
                    },
                    (decodedText) => {
                        setReference(decodedText);
                        void stopScanner();
                        toast.success('بارکد با موفقیت خوانده شد');
                        setStep('result');
                    },
                    () => {}
                );
                if (!cancelled) setIsCameraActive(true);
            } catch (err) {
                console.error("Camera error:", err);
                if (!cancelled) toast.error("خطا در دسترسی به دوربین");
            }
        };

        const timeout = setTimeout(startScanner, 100);
        return () => {
            cancelled = true;
            clearTimeout(timeout);
            void stopScanner();
        };
    }, [isOpen, step]);

    const handleClose = () => {
        void stopScanner();
        setStep('scanning');
        setReference('');
        setTimeout(() => onClose(), 0);
    };

    const handleAccept = () => {
        verifyAttendance.mutate(reference, {
            onSuccess: (confirmed) => {
                if (confirmed) {
                    toast.success('ورود با موفقیت ثبت شد');
                    handleClose();
                } else {
                    toast.error('ثبت ورود ناموفق بود');
                }
            },
        });
    };

    const handleNoShow = () => {
        markNoShow.mutate(reference, {
            onSuccess: (recorded) => {
                if (recorded) {
                    toast.success('عدم حضور ثبت شد');
                    handleClose();
                } else {
                    toast.error('ثبت عدم حضور ناموفق بود');
                }
            },
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" dir="rtl">
            <div className="bg-white rounded-[20px] w-full max-w-[480px] shadow-2xl relative animate-[scaleIn_0.2s_ease-out] p-6 pb-8">

                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-[15px] font-bold text-gray-800">ثبت ورود</h3>
                    <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                        <LuX size={20} />
                    </button>
                </div>

                {step === 'scanning' ? (
                    <div className="flex flex-col items-center">
                        <div className="w-full max-w-[320px] aspect-square bg-gray-100 rounded-[20px] overflow-hidden flex items-center justify-center relative shadow-inner border-[1.5px] border-gray-200">
                            <div id="qr-reader" className="w-full h-full [&>video]:object-cover"></div>
                            {!isCameraActive && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 z-10 gap-3 bg-gray-50/90 backdrop-blur-sm">
                                    <LuCamera size={42} className="opacity-50 animate-pulse" />
                                    <span className="text-[13px] font-medium">در حال راه اندازی دوربین...</span>
                                </div>
                            )}
                        </div>
                        <p className="mt-8 text-[13px] text-gray-500 text-center font-medium leading-relaxed max-w-[80%]">
                            برای ثبت ورود، بارکد (QR Code) کاربر را مقابل دوربین قرار دهید
                        </p>
                    </div>
                ) : isLoadingDetail ? (
                    <div className="py-16 flex flex-col items-center justify-center gap-3 text-gray-400 animate-[fadeIn_0.3s_ease-out]">
                        <span className="inline-block w-8 h-8 border-[3px] border-gray-200 border-t-primary-500 rounded-full animate-spin" />
                        <span className="text-[13px] font-medium">در حال دریافت اطلاعات رزرو...</span>
                    </div>
                ) : !detail ? (
                    <div className="py-16 flex flex-col items-center justify-center gap-2 text-center animate-[fadeIn_0.3s_ease-out]">
                        <span className="text-[14px] font-bold text-gray-700">رزرو یافت نشد</span>
                        <span className="text-[13px] text-gray-400 max-w-[80%]">بارکد معتبر نیست یا این رزرو متعلق به باشگاه شما نیست.</span>
                    </div>
                ) : (
                    <div className="flex flex-col gap-5 animate-[fadeIn_0.3s_ease-out]">
                        <div className="flex items-center justify-between p-5 bg-primary-50/50 rounded-[16px] border border-primary-50">
                            <div className="flex items-center gap-4 text-right">
                                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary-600 shadow-sm border border-primary-100/50 shrink-0">
                                    <BsPerson size={22} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-gray-800 text-[15px] mb-1">{detail.clinetFullName}</span>
                                    <span className="text-gray-500 text-[13px] font-medium" dir="rtl">{toPersianDigits(detail.clientPhoneNumber)}</span>
                                </div>
                            </div>
                            <span className="px-5 py-1.5 rounded-full border border-primary-400 text-primary-600 text-[12px] font-bold bg-white shadow-sm shrink-0">
                                {detail.gymTrendTitle}
                            </span>
                        </div>

                        <div className="p-6 pb-2 border border-gray-100 rounded-[16px] flex flex-col gap-[22px]">
                            <div className="flex items-center gap-3">
                                <LuCalendar className="text-gray-400" size={18} />
                                <span className="text-[13px] text-gray-500 font-medium">تاریخ</span>
                                <div className="flex-1 border-b-[1.5px] border-dashed border-gray-100 mt-1 mx-2"></div>
                                <span className="text-[14px] font-bold text-gray-800">{formatJalaliLong(detail.sessionDate)}</span>
                            </div>

                            <div className="flex items-center gap-3">
                                <LuClock className="text-gray-400" size={18} />
                                <span className="text-[13px] text-gray-500 font-medium">ساعت</span>
                                <div className="flex-1 border-b-[1.5px] border-dashed border-gray-100 mt-1 mx-2"></div>
                                <span className="text-[14px] font-bold text-gray-800">
                                    {detail.gymStart && detail.gymEnd
                                        ? `${toPersianDigits(String(detail.gymStart).padStart(4, '0').slice(0, 2))} تا ${toPersianDigits(String(detail.gymEnd).padStart(4, '0').slice(0, 2))}`
                                        : formatSessionTime(detail.gymStart, detail.gymEnd)}
                                </span>
                            </div>

                            <div className="flex items-center gap-3 pb-[18px]">
                                <LuBanknote className="text-gray-400" size={18} />
                                <span className="text-[13px] text-gray-500 font-medium">مبلغ</span>
                                <div className="flex-1 border-b-[1.5px] border-dashed border-gray-100 mt-1 mx-2"></div>
                                <span className="text-[14px] font-bold text-gray-800">{formatToman(detail.sessionPrice)}</span>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-2">
                            <button
                                onClick={handleNoShow}
                                disabled={isActing}
                                className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 rounded-full text-[13px] font-bold hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {markNoShow.isPending ? 'در حال ثبت...' : 'عدم ورود'}
                            </button>
                            <button
                                onClick={handleAccept}
                                disabled={isActing}
                                className="flex-1 py-3 bg-primary-500 text-white rounded-full text-[13px] font-bold hover:bg-primary-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {verifyAttendance.isPending ? 'در حال ثبت...' : 'ورود موفق'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
