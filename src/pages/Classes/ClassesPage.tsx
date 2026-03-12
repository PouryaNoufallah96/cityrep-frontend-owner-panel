import { useState, useRef, useEffect, useCallback } from 'react';
import { BsSearch, BsChevronDown, BsChevronLeft, BsChevronRight, BsCheck } from 'react-icons/bs';
import { LuFilter, LuX } from 'react-icons/lu';
import Sidebar from '../../components/layout/Sidebar';
import PageHeader from '../../components/layout/PageHeader';
import StatusToggleModal, { type ClassItemData } from './components/StatusToggleModal';
import { useGymTrends, useGyms } from '../../hooks/useGym';
import { scheduleService } from '../../services/scheduleService';
import { toast } from 'react-toastify';

const FILTER_OPTIONS = {
    day: ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'],
    sport: [],
    gender: ['آقایان', 'بانوان'],
    status: ['فعال', 'غیرفعال']
};

const FILTER_MAPPINGS = {
    day: { 'شنبه': 'Saturday', 'یکشنبه': 'Sunday', 'دوشنبه': 'Monday', 'سه‌شنبه': 'Tuesday', 'چهارشنبه': 'Wednesday', 'پنج‌شنبه': 'Thursday', 'جمعه': 'Friday' },
    gender: { 'آقایان': 'Male', 'بانوان': 'Female' },
    status: { 'فعال': 'Active', 'غیرفعال': 'InActive' }
};

const REVERSE_FILTER_MAPPINGS = {
    day: { 'Saturday': 'شنبه', 'Sunday': 'یکشنبه', 'Monday': 'دوشنبه', 'Tuesday': 'سه‌شنبه', 'Wednesday': 'چهارشنبه', 'Thursday': 'پنج‌شنبه', 'Friday': 'جمعه' },
    gender: { 'Male': 'آقایان', 'Female': 'بانوان', 'men': 'آقایان', 'women': 'بانوان', 'both': 'آقایان، بانوان' },
    status: { 'Active': 'فعال', 'InActive': 'غیرفعال' }
};

const formatTime = (timeNum?: number | string) => {
    if (timeNum === undefined || timeNum === null) return '';
    const s = timeNum.toString().padStart(4, '0');
    return `${s.slice(0, 2)}:${s.slice(2, 4)}`;
};


export default function ClassesPage() {
    const { data: gymsResponse } = useGyms();
    const gym = gymsResponse?.data?.data?.[0];
    const gymId = gym?.gymId || '';

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
        day: ['همه'],
        sport: ['همه'],
        gender: ['همه'],
        status: ['همه']
    });

    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [classes, setClasses] = useState<ClassItemData[]>([]);
    const [isLoading, setIsLoading] = useState(false);

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

    const fetchClasses = useCallback(async () => {
        if (!gymId) return;

        setIsLoading(true);
        try {
            const getMapping = (arr: string[], mapObj: Record<string, string>) => {
                if (arr.includes('همه') || arr.length === 0) return [];
                return arr.map(a => mapObj[a]).filter(Boolean);
            };

            const selectedDays = getMapping(filters.day, FILTER_MAPPINGS.day);
            const selectedGenders = getMapping(filters.gender, FILTER_MAPPINGS.gender);
            const selectedStatus = getMapping(filters.status, FILTER_MAPPINGS.status);

            const selectedTrendIds = filters.sport.includes('همه')
                ? []
                : filters.sport.map(title => apiTrends.find((t: any) => t.title === title)?.gymTrendId).filter(Boolean);

            const payload = {
                gymId,
                pagination: { page, size },
                genders: selectedGenders,
                gymTrendIds: selectedTrendIds,
                days: selectedDays,
                sessionActivity: selectedStatus,
                search: search.trim()
            };

            const response = await scheduleService.getSessionsList(payload);
            const items = response?.data?.data || [];
            const total = response?.data?.totalCount || items.length;

            const mapped = items.map((item: any) => ({
                id: item.gymSessionId,
                gymId: item.gymId || gymId,
                gymTrendId: item.gymTrendId,
                day: REVERSE_FILTER_MAPPINGS.day[item.dayOfWeek as keyof typeof REVERSE_FILTER_MAPPINGS.day] || item.dayOfWeek,
                sport: item.gymTrendTitle || apiTrends.find((t: any) => t.gymTrendId === item.gymTrendId)?.title || '-',
                gender: REVERSE_FILTER_MAPPINGS.gender[item.gender as keyof typeof REVERSE_FILTER_MAPPINGS.gender] || item.gender,
                price: Number(item.price || 0).toLocaleString('fa-IR'),
                time: item.from && item.to ? `${formatTime(item.from)} - ${formatTime(item.to)}` : 'تایم آزاد',
                reservations: item.reserveCount || 0,
                isActive: item.activity === 'Active' || item.isActive === true
            }));

            setClasses(mapped);
            setTotalCount(total);
        } catch (error) {
            console.error(error);
            toast.error('خطا در دریافت لیست کلاس‌ها');
        } finally {
            setIsLoading(false);
        }
    }, [gymId, page, size, filters, search, apiTrends]);

    useEffect(() => {
        if (gymId) {
            fetchClasses();
        }
    }, [gymId, page, size]);

    const handleSearchClick = () => {
        setPage(1);
        fetchClasses();
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearchClick();
        }
    };

    const [statusModal, setStatusModal] = useState<{ isOpen: boolean; classData: ClassItemData | null }>({
        isOpen: false,
        classData: null
    });
    const [isStatusToggling, setIsStatusToggling] = useState(false);

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

    const handleToggleClick = (cls: ClassItemData) => {
        setStatusModal({ isOpen: true, classData: cls });
    };

    const handleConfirmStatus = async () => {
        if (!statusModal.classData || !gymId) return;

        const cls = statusModal.classData;
        setIsStatusToggling(true);

        try {
            await scheduleService.toggleSessionActivity({
                gymId,
                gymTrendId: cls.gymTrendId || '',
                gymSessionId: cls.id
            });

            setClasses(prev => prev.map(c =>
                c.id === cls.id ? { ...c, isActive: !c.isActive } : c
            ));

            toast.success(`سانس با موفقیت ${cls.isActive ? 'غیرفعال' : 'فعال'} شد.`);
            setStatusModal({ isOpen: false, classData: null });
        } catch (err) {
            console.error(err);
            toast.error('خطا در تغییر وضعیت سانس');
        } finally {
            setIsStatusToggling(false);
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
                        <PageHeader title="لیست کلاس‌ها" />

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
                                        تعداد کل: {String(totalCount || classes.length).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)])}
                                    </div>
                                </div>

                                <div className="relative w-full md:w-[320px]">
                                    <input
                                        type="text"
                                        placeholder="جستجو"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={handleSearchKeyDown}
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
                                    <div ref={filterRef} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                                        {renderDropdown('day', 'روز')}
                                        {renderDropdown('sport', 'رشته ورزشی')}
                                        {renderDropdown('gender', 'جنسیت')}
                                        {renderDropdown('status', 'وضعیت')}
                                    </div>
                                    <div className="mt-8 flex justify-end">
                                        <button
                                            onClick={handleSearchClick}
                                            className="w-[120px] h-11 bg-primary-500 text-white rounded-xl text-[13px] font-bold shadow-[0_4px_12px_rgba(124,77,255,0.25)] hover:bg-primary-600 transition-colors"
                                        >
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
                                            <th className="py-5 px-6 text-[13px] font-bold text-gray-700 w-[15%]">روز</th>
                                            <th className="py-5 px-6 text-[13px] font-bold text-gray-700 w-[20%] text-center">رشته ورزشی</th>
                                            <th className="py-5 px-6 text-[13px] font-bold text-gray-700 w-[15%] text-center">جنسیت</th>
                                            <th className="py-5 px-6 text-[13px] font-bold text-gray-700 w-[20%] text-center">مبلغ (تومان)</th>
                                            <th className="py-5 px-6 text-[13px] font-bold text-gray-700 w-[15%] text-center">زمان ورزش</th>
                                            <th className="py-5 px-6 text-[13px] font-bold text-gray-700 w-[15%] text-center">تعداد رزرو</th>
                                            <th className="py-5 px-6 text-[13px] font-bold text-gray-700 w-[10%] text-left">وضعیت</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan={7} className="py-10 text-center text-gray-500 font-medium">
                                                    در حال دریافت اطلاعات...
                                                </td>
                                            </tr>
                                        ) : classes.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="py-10 text-center text-gray-500 font-medium">
                                                    هیچ موردی یافت نشد.
                                                </td>
                                            </tr>
                                        ) : (
                                            classes.map((cls, index) => (
                                                <tr key={cls.id} className={`transition-colors hover:bg-gray-50/50 ${index !== classes.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                                    <td className="py-5 px-6 text-[13px] font-medium text-gray-600">{cls.day}</td>
                                                    <td className="py-5 px-6 text-[13px] font-medium text-gray-600 text-center">{cls.sport}</td>
                                                    <td className="py-5 px-6 text-[13px] font-medium text-gray-600 text-center">{cls.gender}</td>
                                                    <td className="py-5 px-6 text-[14px] font-bold text-gray-700 text-center">{cls.price}</td>
                                                    <td className="py-5 px-6 text-[13px] font-medium text-gray-600 text-center" dir="rtl">{cls.time}</td>
                                                    <td className="py-5 px-6 text-[14px] font-bold text-gray-700 text-center">{cls.reservations}</td>
                                                    <td className="py-5 px-6 text-left">
                                                        {/* Toggle Switch */}
                                                        <button
                                                            onClick={() => handleToggleClick(cls)}
                                                            className={`w-11 h-6 rounded-full relative transition-[background-color] duration-300 ml-1 shrink-0 ${cls.isActive ? 'bg-primary-600' : 'bg-gray-300'}`}
                                                        >
                                                            <div
                                                                className={`w-[20px] h-[20px] rounded-full bg-white absolute top-[2px] shadow-sm transition-all duration-300 ease-in-out`}
                                                                style={cls.isActive ? { left: '2px', transform: 'translateX(0)' } : { left: 'calc(100% - 22px)', transform: 'translateX(0)' }}
                                                            ></div>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Footer */}
                            {!isLoading && classes.length > 0 && (
                                <div className="flex items-center justify-between mt-8 mb-2">
                                    <div className="flex items-center gap-2">
                                        <button
                                            disabled={page === 1}
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-50"
                                        >
                                            <BsChevronRight size={12} />
                                        </button>
                                        <button
                                            className="w-8 h-8 rounded-full text-[13px] font-bold transition-colors bg-primary-500 text-white shadow-md cursor-default"
                                            dir="ltr"
                                        >
                                            {String(page).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)])}
                                        </button>
                                        <button
                                            disabled={classes.length < size}
                                            onClick={() => setPage(p => p + 1)}
                                            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-50"
                                        >
                                            <BsChevronLeft size={12} />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-2 text-[13px]">
                                        <span className="text-gray-500">تعداد نمایش: </span>
                                        <select
                                            value={size}
                                            onChange={(e) => { setSize(Number(e.target.value)); setPage(1); }}
                                            className="w-[64px] h-9 border border-gray-200 rounded-lg flex items-center justify-between px-3 cursor-pointer hover:border-gray-300 transition-colors bg-white font-bold text-gray-700 outline-none appearance-none"
                                            style={{
                                                backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2210%22%20height%3D%225%22%20viewBox%3D%220%200%2010%205%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M0%200l5%205%205-5z%22%2F%3E%3C%2Fsvg%3E")`,
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: 'left 8px center',
                                                backgroundSize: '10px 5px',
                                            }}
                                        >
                                            <option value={10}>۱۰</option>
                                            <option value={20}>۲۰</option>
                                            <option value={50}>۵۰</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </main>
            </div>

            {/* Modals */}
            <StatusToggleModal
                isOpen={statusModal.isOpen}
                onClose={() => setStatusModal({ isOpen: false, classData: null })}
                onConfirm={handleConfirmStatus}
                classData={statusModal.classData}
                isLoading={isStatusToggling}
            />

        </div>
    );
}
