import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineArrowRight } from 'react-icons/hi';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useRequestOtp, useVerifyOtp, useGymOwnerData } from '../../hooks/useAuth';
import Logo from '../../components/Logo';

type Step = 'phone' | 'otp';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

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

    const formatPhoneNumber = (phone: string) => {
        return phone;
    };

    const handleSendOtp = async (e: FormEvent) => {
        e.preventDefault();
        if (!phoneNumber || phoneNumber.length < 11) {
            toast.error('لطفا شماره موبایل معتبر وارد کنید');
            return;
        }
        const formattedPhone = formatPhoneNumber(phoneNumber);
        requestOtpMutation.mutate(formattedPhone, {
            onSuccess: () => {
                setStep('otp');
                setCountdown(120);
                toast.success('کد تایید ارسال شد');
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || 'خطا در ارسال کد تایید');
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

    const handleVerifyOtp = async (e: FormEvent) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length !== 4) {
            toast.error('لطفا کد ۴ رقمی را کامل وارد کنید');
            return;
        }
        const formattedPhone = formatPhoneNumber(phoneNumber);
        verifyOtpMutation.mutate(
            { phoneNumber: formattedPhone, code },
            {
                onSuccess: async (result) => {
                    login(result.access_token, result.refresh_token);
                    gymOwnerDataMutation.mutate(undefined, {
                        onSuccess: (data) => {
                            localStorage.setItem('gymOwner', JSON.stringify(data));
                            toast.success('ورود موفقیت‌آمیز بود');
                            navigate('/dashboard');
                        },
                        onError: () => {
                            // Even if profile fetch fails, user is logged in
                            navigate('/dashboard');
                        },
                    });
                },
                onError: (error: any) => {
                    toast.error(error.response?.data?.message || 'کد تایید نادرست است');
                    setOtp(['', '', '', '']);
                    otpRefs.current[0]?.focus();
                },
            }
        );
    };

    const handleResendOtp = () => {
        if (countdown > 0) return;
        const formattedPhone = formatPhoneNumber(phoneNumber);
        requestOtpMutation.mutate(formattedPhone, {
            onSuccess: () => {
                setCountdown(120);
                setOtp(['', '', '', '']);
                toast.success('کد تایید مجددا ارسال شد');
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || 'خطا در ارسال مجدد کد');
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
        <div className="flex min-h-screen" dir="rtl">
            {/* Form Side */}
            <div className="flex-1 flex flex-col items-center justify-center px-10 py-10 bg-gradient-to-b from-[#f0ebf8] via-[#e8e2f4] to-[#ddd6ee]">
                {/* Logo */}
                <Logo size={48} className="mb-10" textClassName="text-2xl font-bold text-primary-700 tracking-tight" />

                {/* Card */}
                <div className="w-full max-w-[450px] bg-white rounded-2xl px-9 py-10 shadow-lg animate-[slideUp_0.5s_ease-out]">
                    {step === 'phone' ? (
                        <>
                            {/* Tabs */}
                            <div className="flex items-center justify-center gap-2 mb-9 text-[15px]">
                                <span
                                    className={`px-4 py-1.5 rounded-md cursor-pointer font-medium transition-colors`}
                                >
                                    ورود | ثبت نام
                                </span>

                            </div>

                            <form onSubmit={handleSendOtp}>
                                <div className="mb-6">
                                    <label className="block text-right text-[13px] font-semibold text-gray-900 mb-2">
                                        شماره موبایل
                                    </label>
                                    <input
                                        id="phone-input"
                                        type="tel"
                                        className="w-full px-4 py-3.5 border-[1.5px] border-gray-200 rounded-[10px] text-sm text-gray-900 bg-white transition-all duration-250 placeholder:text-gray-400 focus:border-primary-400 focus:ring-[3px] focus:ring-primary-400/10 outline-none"
                                        placeholder="شماره موبایل"
                                        value={phoneNumber}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setPhoneNumber(e.target.value)}
                                        autoComplete="tel"
                                        dir="ltr"
                                        style={{ textAlign: 'right' }}
                                    />
                                </div>

                                <div className="flex items-center gap-2 mb-7 flex-row-reverse justify-end">
                                    <input type="checkbox" id="remember" className="w-4 h-4 accent-primary-500 cursor-pointer" />
                                    <label htmlFor="remember" className="text-[13px] text-gray-500 cursor-pointer">
                                        مرا به خاطر بسپار
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3.5 bg-gradient-to-br from-primary-400 to-primary-500 text-white rounded-[10px] text-[15px] font-semibold cursor-pointer transition-all duration-250 hover:from-primary-500 hover:to-primary-600 hover:shadow-[0_4px_15px_rgba(124,77,255,0.35)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0"
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
                        <div className="animate-[slideUp_0.4s_ease-out]">
                            <button
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
                                {formatPhoneNumber(phoneNumber)}
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
                                            className="w-[52px] h-14 text-center text-[22px] font-bold border-[1.5px] border-gray-200 rounded-[10px] bg-white transition-all duration-250 text-primary-700 focus:border-primary-400 focus:ring-[3px] focus:ring-primary-400/15 outline-none"
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
                                    className="w-full py-3.5 bg-gradient-to-br from-primary-400 to-primary-500 text-white rounded-[10px] text-[15px] font-semibold cursor-pointer transition-all duration-250 hover:from-primary-500 hover:to-primary-600 hover:shadow-[0_4px_15px_rgba(124,77,255,0.35)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0"
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
                                        className="text-[13px] text-primary-500 cursor-pointer transition-colors font-medium hover:text-primary-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                                        onClick={handleResendOtp}
                                        disabled={isLoading}
                                    >
                                        ارسال مجدد کد تایید
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Image Side */}
            <div className="flex-1 max-w-[50%] relative overflow-hidden max-md:hidden">
                <img
                    src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80"
                    alt="Gym"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/15 to-black/20" />
            </div>
        </div>
    );
}
