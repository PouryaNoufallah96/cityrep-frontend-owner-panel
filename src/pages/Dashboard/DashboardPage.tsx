import { useState } from 'react';

import { LuArrowUpRight, LuChevronLeft } from 'react-icons/lu';
import Sidebar from '../../components/layout/Sidebar';
import PageHeader from '../../components/layout/PageHeader';
import ScanQrModal from './components/ScanQrModal';
import { useGymOwnerOverview, useGymTrendCapacity, useCurrentWeekReservations } from '../../hooks/useGym';
import { formatNumber, toPersianDigits } from '../../utils/format';
import scanEntryArt from '../../assets/scan-entry.svg';

const WEEK_DAYS = [
    { dayOfWeek: 'Saturday', label: 'شنبه' },
    { dayOfWeek: 'Sunday', label: '۱ شنبه' },
    { dayOfWeek: 'Monday', label: '۲ شنبه' },
    { dayOfWeek: 'Tuesday', label: '۳ شنبه' },
    { dayOfWeek: 'Wednesday', label: '۴ شنبه' },
    { dayOfWeek: 'Thursday', label: '۵ شنبه' },
    { dayOfWeek: 'Friday', label: 'جمعه' },
];

const RING_RADII = [80, 60, 40];

export default function DashboardPage() {
    const [isScanModalOpen, setIsScanModalOpen] = useState(false);

    const { data: overview, isPending: overviewPending, isError: overviewError } = useGymOwnerOverview();
    const { data: capacity, isPending: capacityPending, isError: capacityError } = useGymTrendCapacity();
    const { data: weekReservations, isPending: weekPending, isError: weekError } = useCurrentWeekReservations();

    const rings = RING_RADII.map((r, index) => {
        const trend = capacity?.[index];
        const ratio = trend && trend.totalCapacity > 0
            ? Math.min(trend.totalUsedCapacity / trend.totalCapacity, 1)
            : 0;
        const circumference = 2 * Math.PI * r;
        return { circumference, offset: circumference * (1 - ratio) };
    });

    const countByDay = new Map((weekReservations ?? []).map(d => [d.dayOfWeek, d.count] as const));
    const chartData = WEEK_DAYS.map(({ dayOfWeek, label }) => ({
        day: label,
        value: countByDay.get(dayOfWeek) ?? 0,
    }));

    const stats = [
        { title: 'مبلغ درآمد (تومان)', value: overview?.totalIncome, emphasized: false },
        { title: 'رزروهای فعال', value: overview?.totalActiveReserved, emphasized: false },
        { title: 'تعداد کل رزروها', value: overview?.totalReserved, emphasized: true },
    ];

    return (
        <div className="min-h-screen bg-gray-50/50 flex" dir="rtl">
            <Sidebar />

            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <main className="flex-1 p-8 max-sm:p-4 overflow-y-auto">
                    <div className="max-w-[1200px] mx-auto flex flex-col gap-6">

                        <PageHeader title="داشبورد" />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {stats.map((card, index) => (
                                <div
                                    key={index}
                                    className={`rounded-[16px] p-6 flex flex-col justify-between h-[120px] overflow-hidden shadow-sm ${
                                        card.emphasized ? 'bg-primary-600' : 'bg-primary-50'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <h3 className={`text-[14px] font-medium flex-1 text-right ${
                                            card.emphasized ? 'text-white/90' : 'text-primary-600'
                                        }`}>
                                            {card.title}
                                        </h3>
                                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${
                                            card.emphasized ? 'border-white/40 text-white' : 'border-primary-200 text-primary-500'
                                        }`}>
                                            <LuArrowUpRight size={16} />
                                        </div>
                                    </div>
                                    <div className={`text-[28px] font-bold tracking-wide leading-none mt-2 text-right ${
                                        card.emphasized ? 'text-white' : 'text-primary-600'
                                    }`}>
                                        {overviewPending ? (
                                            <span className={`inline-block w-7 h-7 border-[3px] rounded-full animate-spin ${
                                                card.emphasized ? 'border-white/40 border-t-white' : 'border-primary-200 border-t-primary-500'
                                            }`} />
                                        ) : overviewError ? '—' : formatNumber(card.value ?? 0)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsScanModalOpen(true)}
                            className="bg-primary-600 rounded-[16px] p-6 flex items-center gap-4 mt-2 cursor-pointer transition-transform hover:-translate-y-0.5 text-right w-full"
                        >
                            <img src={scanEntryArt} alt="" className="w-[72px] h-[72px] shrink-0" />
                            <div className="flex flex-col flex-1 min-w-0">
                                <span className="text-white font-bold text-[15px] mb-1">ثبت ورود</span>
                                <span className="text-white/80 text-[13px]">برای ثبت ورود، QR روی گوشی کاربر را اسکن کنید.</span>
                            </div>
                            <div className="w-10 h-10 rounded-full border border-white/40 flex items-center justify-center text-white shrink-0">
                                <LuChevronLeft size={20} />
                            </div>
                        </button>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
                            <div className="bg-white rounded-[16px] p-6 border border-gray-100 shadow-sm min-h-[300px] flex flex-col lg:order-2">
                                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                                    <h2 className="text-[14px] font-bold text-gray-800">ظرفیت ورزش‌ها</h2>
                                </div>
                                <div className="flex-1 flex items-center justify-center relative">
                                    <svg width="220" height="220" viewBox="0 0 200 200" className="rotate-[-90deg]">
                                        <circle cx="100" cy="100" r="80" className="stroke-primary-50" strokeWidth="12" fill="none" />
                                        <circle cx="100" cy="100" r="80" className="stroke-primary-500" strokeWidth="12" fill="none" strokeDasharray={rings[0].circumference} strokeDashoffset={rings[0].offset} strokeLinecap="round" />

                                        <circle cx="100" cy="100" r="60" className="stroke-primary-50" strokeWidth="12" fill="none" />
                                        <circle cx="100" cy="100" r="60" className="stroke-primary-400" strokeWidth="12" fill="none" strokeDasharray={rings[1].circumference} strokeDashoffset={rings[1].offset} strokeLinecap="round" />

                                        <circle cx="100" cy="100" r="40" className="stroke-primary-50" strokeWidth="12" fill="none" />
                                        <circle cx="100" cy="100" r="40" className="stroke-primary-300" strokeWidth="12" fill="none" strokeDasharray={rings[2].circumference} strokeDashoffset={rings[2].offset} strokeLinecap="round" />
                                    </svg>

                                    {capacityPending && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-white">
                                            <span className="inline-block w-8 h-8 border-[3px] border-primary-200 border-t-primary-500 rounded-full animate-spin" />
                                        </div>
                                    )}
                                    {capacityError && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-white text-[13px] font-medium text-gray-500">
                                            خطا در دریافت اطلاعات
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white rounded-[16px] p-6 border border-gray-100 shadow-sm min-h-[300px] flex flex-col lg:order-1">
                                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                                    <h2 className="text-[14px] font-bold text-gray-800">تعداد رزروها</h2>
                                </div>
                                <div className="flex-1 relative min-h-[200px]">
                                    {weekPending && (
                                        <div className="absolute inset-0 flex items-center justify-center z-30 bg-white">
                                            <span className="inline-block w-8 h-8 border-[3px] border-primary-200 border-t-primary-500 rounded-full animate-spin" />
                                        </div>
                                    )}
                                    {weekError && (
                                        <div className="absolute inset-0 flex items-center justify-center z-30 bg-white text-[13px] font-medium text-gray-500">
                                            خطا در دریافت اطلاعات
                                        </div>
                                    )}
                                    <div className="absolute inset-x-0 top-6 bottom-8 z-0 pointer-events-none">
                                        {[30, 20, 10, 0].map(val => {
                                            const bottomPercent = (val / 30) * 100;
                                            return (
                                                <div key={val} className="absolute inset-x-0 w-full h-0 flex items-center justify-end" style={{ bottom: `${bottomPercent}%` }}>
                                                    <span className="absolute right-0 text-[11px] text-gray-500 font-medium translate-y-[-50%] w-6 text-right mb-[1px]">
                                                        {toPersianDigits(val)}
                                                    </span>
                                                    <div className={`w-[calc(100%-32px)] ${val === 0 ? 'border-b border-gray-200' : 'border-b-[1.5px] border-dashed border-gray-100'}`} />
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="absolute inset-0 left-0 right-8 bottom-8 top-6 flex justify-between items-end z-10 px-8 max-sm:px-2">
                                        {chartData.map((item, index) => {
                                            const heightPercentage = Math.min((item.value / 30) * 100, 100);
                                            return (
                                                <div key={index} className="flex flex-col items-center justify-end h-full w-[30px] relative mb-[1.5px]">
                                                    <div
                                                        className="w-[14px] h-[14px] rounded-full bg-primary-600 z-20"
                                                        style={{ marginBottom: '-7px' }}
                                                    />
                                                    <div
                                                        className="w-[5px] bg-[#EBE5FF] rounded-t-full"
                                                        style={{ height: `${Math.max(heightPercentage, 4)}%` }}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="absolute inset-x-0 left-0 right-8 bottom-0 h-6 flex justify-between items-end z-10 px-8 max-sm:px-2">
                                        {chartData.map((item, index) => (
                                            <div key={index} className="w-[30px] text-center text-[10px] text-gray-500">
                                                {item.day}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {isScanModalOpen && (
                            <ScanQrModal
                                isOpen
                                onClose={() => setIsScanModalOpen(false)}
                            />
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
