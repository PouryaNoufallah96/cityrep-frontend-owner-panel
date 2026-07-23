import { HiCheck, HiOutlineArrowLeft } from 'react-icons/hi';
import { LuTriangleAlert } from 'react-icons/lu';

interface RegisterSuccessProps {
    onSchedule: () => void;
}

export default function RegisterSuccess({ onSchedule }: RegisterSuccessProps) {
    return (
        <div className="flex flex-col items-center justify-center text-center animate-[fadeIn_0.4s_ease-out] py-12 min-h-[460px]">
            <div className="w-[72px] h-[72px] rounded-full bg-[#22C55E] text-white flex items-center justify-center mb-8 shadow-[0_0_0_12px_rgba(34,197,94,0.15)]">
                <HiCheck size={36} strokeWidth={2.5} />
            </div>

            <h2 className="text-[17px] font-bold text-gray-900 mb-3">ثبت‌نام شما با موفقیت انجام شد.</h2>
            <p className="text-[13px] text-gray-500 leading-7 mb-6 max-w-[420px]">
                برای وارد کردن زمان‌بندی کلاس‌ها وارد منوی مدیریت زمان‌بندی شوید.
            </p>

            <div className="flex items-center gap-2.5 w-full max-w-[480px] bg-[#FFF8E1] text-[#8A6A1F] rounded-xl px-5 py-4 mb-10 text-[13px] font-medium leading-7 text-right">
                <LuTriangleAlert size={20} className="shrink-0 text-[#E6B800]" />
                <span>باشگاه شما پس از ثبت زمان‌بندی کلاس‌ها برای کاربران قابل مشاهده خواهد بود.</span>
            </div>

            <button
                type="button"
                onClick={onSchedule}
                className="flex items-center gap-2 text-sm font-semibold text-[#3C25C9] cursor-pointer transition-colors hover:text-[#2F1CA3]"
            >
                مدیریت زمان‌بندی
                <HiOutlineArrowLeft size={16} />
            </button>
        </div>
    );
}
