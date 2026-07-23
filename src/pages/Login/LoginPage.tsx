import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineArrowRight } from 'react-icons/hi';
import { toast } from 'react-toastify';
import { useRequestOtp, useVerifyOtp, useGymOwnerData } from '../../hooks/useAuth';
import Logo from '../../components/Logo';
import Input from '../../components/ui/Input';

type Step = 'phone' | 'otp';

export default function LoginPage() {
    const navigate = useNavigate();

    const [step, setStep] = useState<Step>('phone');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState(['', '', '', '']);
    const [countdown, setCountdown] = useState(0);

    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    const requestOtpMutation = useRequestOtp();
    const verifyOtpMutation = useVerifyOtp();
    const gymOwnerDataMutation = useGymOwnerData();

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleSendOtp = (e: FormEvent) => {
        e.preventDefault();
        if (!phoneNumber || phoneNumber.length < 11) {
            toast.error('لطفا شماره موبایل معتبر وارد کنید');
            return;
        }
        requestOtpMutation.mutate(phoneNumber, {
            onSuccess: () => {
                setStep('otp');
                setCountdown(120);
                toast.success('کد تایید ارسال شد');
            },
        });
    };

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        if (value && index < 4) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleVerifyOtp = (e: FormEvent) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length !== 4) {
            toast.error('لطفا کد ۴ رقمی را کامل وارد کنید');
            return;
        }
        verifyOtpMutation.mutate(
            { phoneNumber, code },
            {
                onSuccess: () => {
                    gymOwnerDataMutation.mutate(undefined, {
                        onSuccess: (data) => {
                            localStorage.setItem('gymOwner', JSON.stringify(data));
                            toast.success('ورود موفقیت‌آمیز بود');
                            navigate('/dashboard');
                        },
                        onError: () => {
                            navigate('/dashboard');
                        },
                    });
                },
                onError: () => {
                    setOtp(['', '', '', '']);
                    otpRefs.current[0]?.focus();
                },
            }
        );
    };

    const handleResendOtp = () => {
        if (countdown > 0) return;
        requestOtpMutation.mutate(phoneNumber, {
            onSuccess: () => {
                setCountdown(120);
                setOtp(['', '', '', '']);
                toast.success('کد تایید مجددا ارسال شد');
            },
        });
    };

    const formatCountdown = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const isLoading = requestOtpMutation.isPending || verifyOtpMutation.isPending || gymOwnerDataMutation.isPending;

    return (
        <div className="flex min-h-screen py-8 bg-[linear-gradient(180deg,#FFFFFF_0%,#E0D9FF_100%)]" dir="rtl">
            <div className="flex-1 flex flex-col items-center justify-center px-10">
                <Logo size={48} className="mb-10" textClassName="text-2xl font-bold text-gray-800 tracking-tight" />

                <div className="w-full max-w-[450px] bg-white rounded-2xl px-9 py-10 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
                    {step === 'phone' ? (
                        <>
                            <div className="mb-9 text-center">
                                <h1 className="text-base text-gray-900">ورود | ثبت نام</h1>
                                <span className="mx-auto mt-2 block h-1 w-10 rounded-full bg-[linear-gradient(90deg,#94D7D1_0%,#6AB1C7_25%,#79A1D6_50%,#8C91E7_75%,#D6C9FB_100%)]" />
                            </div>

                            <form onSubmit={handleSendOtp}>
                                <div className="mb-8">
                                    <Input
                                        id="phone-input"
                                        label="شماره موبایل"
                                        type="tel"
                                        placeholder="شماره موبایل"
                                        value={phoneNumber}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setPhoneNumber(e.target.value)}
                                        autoComplete="tel"
                                        dir="ltr"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3.5 bg-[#997CDE] text-white rounded-xl text-[15px] font-semibold cursor-pointer transition-colors hover:bg-[#8B6DD4] disabled:opacity-70 disabled:cursor-not-allowed"
                                    disabled={isLoading}
                                    id="send-otp-btn"
                                >
                                    {isLoading ? (
                                        <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        'ارسال کد تایید'
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            <button
                                type="button"
                                className="flex items-center gap-1.5 text-[13px] text-primary-500 cursor-pointer mb-5 py-1 transition-colors hover:text-primary-700"
                                onClick={() => { setStep('phone'); setOtp(['', '', '', '']); }}
                            >
                                <HiOutlineArrowRight />
                                بازگشت
                            </button>

                            <p className="text-[13px] text-gray-500 text-center mb-2 leading-7">
                                کد تایید ارسال شده به شماره زیر را وارد کنید
                            </p>
                            <p className="text-sm font-semibold text-primary-600 text-center mb-7" dir="ltr">
                                {phoneNumber}
                            </p>

                            <form onSubmit={handleVerifyOtp}>
                                <div className="flex gap-3 justify-center mb-7" dir="ltr">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => { otpRefs.current[index] = el; }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            className="w-[52px] h-14 text-center text-[22px] font-bold border-[1.5px] border-gray-200 rounded-[10px] bg-white text-primary-700 transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15 outline-none"
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            autoFocus={index === 0}
                                            id={`otp-input-${index}`}
                                        />
                                    ))}
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3.5 bg-[#997CDE] text-white rounded-xl text-[15px] font-semibold cursor-pointer transition-colors hover:bg-[#8B6DD4] disabled:opacity-70 disabled:cursor-not-allowed"
                                    disabled={isLoading || otp.join('').length !== 4}
                                    id="verify-otp-btn"
                                >
                                    {isLoading ? (
                                        <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        'تایید و ورود'
                                    )}
                                </button>
                            </form>

                            <div className="text-center mt-5">
                                {countdown > 0 ? (
                                    <p className="text-[13px] text-gray-500 mt-1">
                                        ارسال مجدد کد تا {formatCountdown(countdown)}
                                    </p>
                                ) : (
                                    <button
                                        type="button"
                                        className="text-[13px] text-primary-500 cursor-pointer transition-colors font-medium hover:text-primary-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                                        onClick={handleResendOtp}
                                        disabled={isLoading}
                                    >
                                        ارسال مجدد کد تایید
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="flex-1 max-w-[50%] relative overflow-hidden rounded-tr-[80px] rounded-br-[80px] max-md:hidden">
                <img
                    src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80"
                    alt="Gym"
                    className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-black/15" />
            </div>
        </div>
    );
}
