import { useState, useRef, useEffect } from 'react';
import { BsSearch, BsChevronDown, BsChevronLeft, BsChevronRight, BsCheck } from 'react-icons/bs';
import { LuFilter, LuX } from 'react-icons/lu';
import Sidebar from '../../components/layout/Sidebar';
import PageHeader from '../../components/layout/PageHeader';
import { useGymTrends } from '../../hooks/useGym';
import DateRangeModal from '../../components/ui/DateRangeModal';
import { DateObject } from 'react-multi-date-picker';

interface ReservationItem {
    id: string;
    userName: string;
    sport: string;
    date: string;
    time: string;
    price: string;
    status: 'موفق' | 'ناموفق' | 'در انتظار';
}

const FILTER_OPTIONS = {
    sport: [],
    status: ['موفق', 'ناموفق', 'در انتظار']
};

const MOCK_RESERVATIONS: ReservationItem[] = [
    { id: '1', userName: 'علی احمدی', sport: 'بدنسازی', date: '۱۴۰۲/۰۶/۱۲', time: '۱۴:۰۰ - ۱۵:۰۰', price: '۵۰۰,۰۰۰', status: 'موفق' },
    { id: '2', userName: 'سارا حسینی', sport: 'یوگا', date: '۱۴۰۲/۰۶/۱۲', time: '۱۶:۰۰ - ۱۷:۰۰', price: '۴۰۰,۰۰۰', status: 'موفق' },
    { id: '3', userName: 'محمد رضایی', sport: 'پیلاتس', date: '۱۴۰۲/۰۶/۱۳', time: '۱۷:۰۰ - ۱۸:۰۰', price: '۵۰۰,۰۰۰', status: 'در انتظار' },
    { id: '4', userName: 'زهرا نیازی', sport: 'بدنسازی', date: '۱۴۰۲/۰۶/۱۳', time: 'تایم آزاد', price: '۵۰۰,۰۰۰', status: 'ناموفق' },
    { id: '5', userName: 'نیما کریمی', sport: 'بادی پامپ', date: '۱۴۰۲/۰۶/۱۴', time: 'تایم آزاد', price: '۵۰۰,۰۰۰', status: 'موفق' },
    { id: '6', userName: 'مریم طاهری', sport: 'یوگا', date: '۱۴۰۲/۰۶/۱۵', time: '۱۶:۰۰ - ۱۷:۰۰', price: '۴۰۰,۰۰۰', status: 'موفق' },
    { id: '7', userName: 'رضا قاسمی', sport: 'پیلاتس', date: '۱۴۰۲/۰۶/۱۵', time: '۱۸:۰۰ - ۱۹:۰۰', price: '۵۰۰,۰۰۰', status: 'موفق' },
];

export default function ReservationsPage() {
    const { data: apiResponse } = useGymTrends();
    const apiTrends = Array.isArray(apiResponse) ? apiResponse : (apiResponse?.data || []);
    const dynamicSportOptions = apiTrends.map((t: any) => t.title) || [];

    const filterOptionsMap = {
        ...FILTER_OPTIONS,
        sport: dynamicSportOptions.length > 0 ? dynamicSportOptions : FILTER_OPTIONS.sport
    };

    const [isFiltersOpen, setIsFiltersOpen] = useState(true);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [filters, setFilters] = useState<Record<string, string[]>>({
        sport: ['همه'],
        status: ['همه']
    });

    const filterRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const [isDateModalOpen, setIsDateModalOpen] = useState(false);
    const [dateRange, setDateRange] = useState<DateObject[]>([]);

    const [reservations] = useState<ReservationItem[]>(MOCK_RESERVATIONS);

    const toggleFilterItem = (type: string, value: string) => {
        setFilters(prev => {
            const current = prev[type];
            if (value === 'همه') return { ...prev, [type]: ['همه'] };

            let newArray = current.includes(value)
                ? current.filter(item => item !== value)
                : [...current.filter(item => item !== 'همه'), value];

            if (newArray.length === 0) newArray = ['همه'];

            return { ...prev, [type]: newArray };
        });
    };

    const renderDropdown = (key: keyof typeof FILTER_OPTIONS, label: string) => {
        const isOpen = openDropdown === key;
        const options = ['همه', ...filterOptionsMap[key]];

        return (
            <div className="flex flex-col gap-2 relative">
                <label className="text-[12px] font-semibold text-gray-600 pr-1 text-right">{label}</label>
                <div
                    onClick={() => setOpenDropdown(isOpen ? null : key)}
                    className={`h-11 bg-white border ${isOpen ? 'border-primary-400 ring-[3px] ring-primary-50' : 'border-gray-200'} rounded-xl px-4 flex items-center justify-between cursor-pointer group hover:border-primary-200 transition-all duration-200`}
                >
                    <span className="text-[13px] text-gray-500 font-medium truncate">
                        {filters[key].includes('همه') ? 'همه' : filters[key].join('، ')}
                    </span>
                    <BsChevronDown className={`text-gray-400 group-hover:text-primary-500 transition-transform ${isOpen ? 'rotate-180 text-primary-500' : ''}`} size={12} />
                </div>

                {isOpen && (
                    <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] py-2 z-50 max-h-[260px] overflow-y-auto custom-scrollbar animate-[fadeIn_0.15s_ease-out]">
                        {options.map(option => {
                            const isSelected = filters[key].includes(option);
                            return (
                                <div
                                    key={option}
                                    onClick={(e) => { e.stopPropagation(); toggleFilterItem(key, option); }}
                                    className="flex items-center justify-between px-4 py-2 hover:bg-gray-50/80 cursor-pointer transition-colors"
                                >
                                    <span className={`text-[13px] ${isSelected ? 'font-bold text-gray-800' : 'font-medium text-gray-600'}`}>
                                        {option}
                                    </span>
                                    <div className={`w-[18px] h-[18px] rounded-[6px] border flex items-center justify-center transition-all ${isSelected ? 'bg-primary-500 border-primary-500 text-white shadow-sm' : 'bg-white border-gray-300'}`}>
                                        {isSelected && <BsCheck size={16} strokeWidth={0.5} />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    const getStatusStyle = (status: ReservationItem['status']) => {
        switch (status) {
            case 'موفق': return 'bg-green-50 text-green-600 border-green-200';
            case 'ناموفق': return 'bg-red-50 text-red-600 border-red-200';
            case 'در انتظار': return 'bg-orange-50 text-orange-600 border-orange-200';
            default: return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex" dir="rtl">
            <Sidebar />

            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Main */}
                <main className="flex-1 p-8 overflow-y-auto max-sm:p-4 bg-[#F8F9FB]">
                    <div className="max-w-[1200px] mx-auto flex flex-col gap-6">

                        {/* Top Header Card */}
                        <PageHeader title="لیست رزروها" />

                        {/* Content Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 min-h-[calc(100vh-220px)] flex flex-col relative">

                            {/* Top Filters / Search Bar */}
                            <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <button
                                        onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                                        className={`w-[44px] h-[44px] rounded-xl border flex items-center justify-center transition-colors
                                        ${isFiltersOpen ? 'bg-primary-50 border-primary-200 text-primary-600' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                    >
                                        <LuFilter size={20} />
                                    </button>
                                    <div className="h-[44px] px-4 rounded-xl border border-gray-200 bg-gray-50 flex items-center text-[13px] font-medium text-gray-600 shrink-0">
                                        تعداد کل: ۲۵۰
                                    </div>
                                </div>

                                <div className="relative w-full md:w-[320px]">
                                    <input
                                        type="text"
                                        placeholder="جستجوی نام کاربر..."
                                        className="w-full h-[44px] pr-10 pl-4 bg-white border border-gray-200 rounded-xl text-[13px] text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-50 transition-all font-medium"
                                    />
                                    <BsSearch className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                </div>
                            </div>

                            {/* Expandable Filter Box */}
                            {isFiltersOpen && (
                                <div className="bg-gray-50/70 border border-gray-100 rounded-[16px] p-6 mb-8 animate-[fadeIn_0.3s_ease-out]">
                                    <div className="flex justify-between items-center mb-6 border-b border-gray-200/60 pb-4">
                                        <h3 className="text-[14px] font-bold text-gray-700">فیلترها</h3>
                                        <button onClick={() => setIsFiltersOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                            <LuX size={18} />
                                        </button>
                                    </div>
                                    <div ref={filterRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                                        {renderDropdown('sport', 'رشته ورزشی')}
                                        {renderDropdown('status', 'وضعیت')}
                                        <div className="flex flex-col gap-2 col-span-1 lg:col-span-2">
                                            <label className="text-[12px] font-semibold text-gray-600 pr-1 text-right">تاریخ (از - تا)</label>
                                            <div
                                                onClick={() => setIsDateModalOpen(true)}
                                                className="flex items-center gap-3 w-full border border-gray-200 bg-white rounded-xl px-4 h-11 cursor-pointer hover:border-primary-400 transition-colors"
                                            >
                                                <span className={`text-[13px] ${dateRange.length > 0 ? 'text-gray-800 font-bold' : 'text-gray-400'}`}>
                                                    {dateRange.length === 2
                                                        ? `${dateRange[0]?.format('YYYY/MM/DD')} - ${dateRange[1]?.format('YYYY/MM/DD')}`
                                                        : dateRange.length === 1
                                                            ? `${dateRange[0]?.format('YYYY/MM/DD')}`
                                                            : 'انتخاب بازه زمانی...'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-8 flex justify-end">
                                        <button className="w-[120px] h-11 bg-primary-500 text-white rounded-xl text-[13px] font-bold shadow-[0_4px_12px_rgba(124,77,255,0.25)] hover:bg-primary-600 transition-colors">
                                            جستجو
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Table */}
                            <div className="overflow-x-auto border border-gray-100 rounded-[16px] shadow-[0_4px_20px_rgba(0,0,0,0.015)] bg-white pb-2 flex-1">
                                <table className="w-full min-w-[800px] text-right">
                                    <thead>
                                        <tr className="bg-gray-50/50">
                                            <th className="py-5 px-6 text-[13px] font-bold text-gray-700 w-[20%]">نام کاربر</th>
                                            <th className="py-5 px-6 text-[13px] font-bold text-gray-700 w-[15%] text-center">رشته ورزشی</th>
                                            <th className="py-5 px-6 text-[13px] font-bold text-gray-700 w-[15%] text-center">تاریخ</th>
                                            <th className="py-5 px-6 text-[13px] font-bold text-gray-700 w-[15%] text-center">ساعت</th>
                                            <th className="py-5 px-6 text-[13px] font-bold text-gray-700 w-[15%] text-center">مبلغ پرداختی</th>
                                            <th className="py-5 px-6 text-[13px] font-bold text-gray-700 w-[20%] text-center">وضعیت پرداخت</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reservations.map((res, index) => (
                                            <tr key={res.id} className={`transition-colors hover:bg-gray-50/50 ${index !== reservations.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                                <td className="py-5 px-6 text-[13.5px] font-bold text-gray-800">{res.userName}</td>
                                                <td className="py-5 px-6 text-[13px] font-medium text-gray-600 text-center">{res.sport}</td>
                                                <td className="py-5 px-6 text-[13px] font-medium text-gray-600 text-center">{res.date}</td>
                                                <td className="py-5 px-6 text-[13px] font-medium text-gray-600 text-center" dir="rtl">{res.time}</td>
                                                <td className="py-5 px-6 text-[14px] font-bold text-gray-700 text-center">{res.price} تومان</td>
                                                <td className="py-5 px-6 flex justify-center text-center">
                                                    <div className={`px-4 py-1.5 rounded-full border text-[12.5px] font-bold ${getStatusStyle(res.status)}`}>
                                                        {res.status}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Footer */}
                            <div className="flex items-center justify-between mt-8 mb-2">
                                <div className="flex items-center gap-2">
                                    <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors">
                                        <BsChevronRight size={12} />
                                    </button>
                                    {[1, 2, 3, '...', 25].map((pageNum, idx) => (
                                        <button
                                            key={idx}
                                            className={`w-8 h-8 rounded-full text-[13px] font-bold transition-colors ${pageNum === 1 ? 'bg-primary-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
                                            dir="ltr"
                                        >
                                            {String(pageNum).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)])}
                                        </button>
                                    ))}
                                    <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors">
                                        <BsChevronLeft size={12} />
                                    </button>
                                </div>

                                <div className="flex items-center gap-2 text-[13px]">
                                    <span className="text-gray-500">تعداد نمایش: </span>
                                    <div className="w-[64px] h-9 border border-gray-200 rounded-lg flex items-center justify-between px-3 cursor-pointer group hover:border-gray-300 transition-colors bg-white">
                                        <span className="font-bold text-gray-700 mt-1">۱۰</span>
                                        <BsChevronDown className="text-gray-400 group-hover:text-gray-600 transition-colors" size={10} />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </main>
            </div>

            <DateRangeModal
                isOpen={isDateModalOpen}
                onClose={() => setIsDateModalOpen(false)}
                initialDates={dateRange}
                onConfirm={(dates) => setDateRange(dates)}
            />
        </div>
    );
}
