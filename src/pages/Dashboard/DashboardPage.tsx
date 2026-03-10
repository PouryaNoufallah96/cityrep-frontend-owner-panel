import { useState } from 'react';

import { LuArrowUpRight, LuArrowLeft } from 'react-icons/lu';
import { BiScan } from 'react-icons/bi';
import Sidebar from '../../components/layout/Sidebar';
import PageHeader from '../../components/layout/PageHeader';
import ScanQrModal from './components/ScanQrModal';

export default function DashboardPage() {
    const [isScanModalOpen, setIsScanModalOpen] = useState(false);

    const chartData = [
        { day: 'شنبه', value: 18 },
        { day: '۱ شنبه', value: 15 },
        { day: '۲ شنبه', value: 5 },
        { day: '۳ شنبه', value: 9 },
        { day: '۴ شنبه', value: 15 },
        { day: '۵ شنبه', value: 21 },
        { day: 'جمعه', value: 18 },
    ];

    const maxChartValue = 30;

    return (
        <div className="min-h-screen bg-gray-50/50 flex" dir="rtl">
            <Sidebar />

            <div className="flex-1 flex flex-col h-screen overflow-hidden">


                <main className="flex-1 p-8 max-sm:p-4 overflow-y-auto">
                    <div className="max-w-[1200px] mx-auto flex flex-col gap-6">

                        {/* Top Header Card */}
                        <PageHeader title="داشبورد" />

                        {/* Top Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { title: 'مبلغ درآمد (تومان)', value: '۶۰,۰۰۰' },
                                { title: 'رزروهای فعال', value: '۱۴' },
                                { title: 'تعداد کل رزروها', value: '۲۴۰' }
                            ].map((card, index) => (
                                <div key={index} className="rounded-[16px] p-6 shadow-sm flex flex-col justify-between h-[120px] relative group transition-colors duration-300 bg-primary-50 hover:bg-primary-600 cursor-pointer overflow-hidden">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-[14px] font-medium transition-colors duration-300 text-primary-600 group-hover:text-white/90">
                                            {card.title}
                                        </h3>
                                        <div className="w-8 h-8 rounded-full border flex items-center justify-center transition-colors duration-300 border-primary-200 text-primary-500 group-hover:border-white/20 group-hover:text-white/90 group-hover:hover:border-white/50 group-hover:hover:text-white">
                                            <LuArrowUpRight size={16} />
                                        </div>
                                    </div>
                                    <div className="text-[28px] font-bold tracking-widest leading-none mt-2 transition-colors duration-300 text-primary-600 group-hover:text-white">
                                        {card.value}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Scanner Banner */}
                        <div
                            onClick={() => setIsScanModalOpen(true)}
                            className="bg-primary-600 rounded-[16px] p-6 shadow-sm flex items-center justify-between mt-2 cursor-pointer transition-transform hover:-translate-y-0.5 group"
                        >
                            <div className="flex items-center gap-4 text-right">
                                <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-blue-300">
                                    <BiScan size={32} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-white font-bold text-[15px] mb-1">ثبت ورود</span>
                                    <span className="text-white/80 text-[13px]">برای ثبت ورود، QR روی گوشی کاربر را اسکن کنید.</span>
                                </div>
                            </div>

                            <div className="flex justify-center items-center w-12 h-12 rounded-full border border-white/20 text-white/90 group-hover:bg-white/10 transition-colors">
                                <LuArrowLeft size={20} />
                            </div>
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
                            {/* Chart 1: Circular Progress (capacity) */}
                            <div className="bg-white rounded-[16px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 min-h-[300px] flex flex-col">
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="text-[14px] font-bold text-gray-800">ظرفیت ورزش‌ها</h2>
                                </div>
                                <div className="flex-1 flex items-center justify-center relative">
                                    <svg width="220" height="220" viewBox="0 0 200 200" className="rotate-[-90deg]">
                                        {/* Outer Circle (Purple) */}
                                        <circle cx="100" cy="100" r="80" stroke="#F4F2FF" strokeWidth="12" fill="none" />
                                        <circle cx="100" cy="100" r="80" stroke="#8B5CF6" strokeWidth="12" fill="none" strokeDasharray="502" strokeDashoffset="80" strokeLinecap="round" />

                                        {/* Middle Circle (Light Blue) */}
                                        <circle cx="100" cy="100" r="60" stroke="#F4F2FF" strokeWidth="12" fill="none" />
                                        <circle cx="100" cy="100" r="60" stroke="#A78BFA" strokeWidth="12" fill="none" strokeDasharray="377" strokeDashoffset="140" strokeLinecap="round" className="opacity-40" />

                                        {/* Inner Circle (Blue) */}
                                        <circle cx="100" cy="100" r="40" stroke="#F4F2FF" strokeWidth="12" fill="none" />
                                        <circle cx="100" cy="100" r="40" stroke="#3B82F6" strokeWidth="12" fill="none" strokeDasharray="251" strokeDashoffset="160" strokeLinecap="round" />
                                    </svg>
                                </div>
                            </div>

                            {/* Chart 2: Bar Lines (Total Reservations) */}
                            <div className="bg-white rounded-[16px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 min-h-[300px] flex flex-col">
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="text-[14px] font-bold text-gray-800">تعداد رزروها</h2>
                                </div>
                                <div className="flex-1 relative min-h-[200px]">
                                    {/* Y-Axis Guidelines */}
                                    <div className="absolute inset-x-0 top-6 bottom-8 z-0 pointer-events-none">
                                        {[30, 20, 10, 0].map(val => {
                                            const bottomPercent = (val / 30) * 100;
                                            return (
                                                <div key={val} className="absolute inset-x-0 w-full h-0 flex items-center justify-end" style={{ bottom: `${bottomPercent}%` }}>
                                                    <span className="absolute right-0 text-[11px] text-gray-500 font-medium translate-y-[-50%] w-6 text-right mb-[1px]">
                                                        {val === 0 ? '۰' : (val === 10 ? '۱۰' : (val === 20 ? '۲۰' : '۳۰'))}
                                                    </span>
                                                    <div className="w-[calc(100%-32px)] border-b-[1.5px] border-dashed border-gray-100"></div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Chart Bars */}
                                    <div className="absolute inset-0 left-0 right-8 bottom-8 top-6 flex justify-between items-end z-10 px-8 max-sm:px-2">
                                        {chartData.map((item, index) => {
                                            const heightPercentage = (item.value / maxChartValue) * 100;
                                            return (
                                                <div key={index} className="flex flex-col items-center justify-end h-full w-[30px] group relative mb-[1.5px]">
                                                    {/* The dot */}
                                                    <div
                                                        className="w-[14px] h-[14px] rounded-full bg-primary-600 shadow-[0_2px_8px_rgba(124,77,255,0.4)] z-20 transition-transform group-hover:scale-125"
                                                        style={{ marginBottom: '-7px' }}
                                                    />
                                                    {/* The line */}
                                                    <div
                                                        className="w-[5px] bg-[#EBE5FF] rounded-t-full transition-all duration-500 ease-out group-hover:bg-primary-300"
                                                        style={{ height: `${heightPercentage}%` }}
                                                    />

                                                    {/* Absolute positioned tooltip optionally on hover */}
                                                    <div className="hidden group-hover:flex absolute -top-8 bg-gray-900 text-white text-[10px] py-1 px-2 rounded font-medium shadow-md">
                                                        {item.value}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* X-Axis labels */}
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

                        {/* Modals */}
                        <ScanQrModal
                            isOpen={isScanModalOpen}
                            onClose={() => setIsScanModalOpen(false)}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
}
