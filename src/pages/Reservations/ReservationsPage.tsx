import { useState, useRef, useEffect } from 'react';
import { BsSearch, BsChevronDown, BsChevronLeft, BsChevronRight, BsCheck } from 'react-icons/bs';
import { LuFilter, LuX } from 'react-icons/lu';
import Sidebar from '../../components/layout/Sidebar';
import PageHeader from '../../components/layout/PageHeader';
import { useGymTrends } from '../../hooks/useGym';
import { useReservations } from '../../hooks/useReservations';
import DateRangeModal from '../../components/ui/DateRangeModal';
import DetailsModal from '../../components/ui/DetailsModal';
import { DateObject } from 'react-multi-date-picker';
import type { ReservationItem } from '../../services/reservationService';
import {
    getStatusMeta,
    toGregorianDate,
    splitFullName,
    STATUS_FILTER_LABELS,
    statesForStatusLabels,
} from './utils';
import { getPageNumbers } from '../../utils/pagination';
import { toPersianDigits, formatToman, formatNumber, formatSessionTime, formatJalali } from '../../utils/format';
import { thClass, tdClass } from '../../components/ui/tableStyles';

const FILTER_OPTIONS = {
    sport: [] as string[],
    status: STATUS_FILTER_LABELS,
};

export default function ReservationsPage() {
    const { data: apiResponse } = useGymTrends();
    const apiTrends = Array.isArray(apiResponse) ? apiResponse : (apiResponse?.data || []);
    const dynamicSportOptions = apiTrends.map((t: { title: string }) => t.title) || [];

    const filterOptionsMap = {
        ...FILTER_OPTIONS,
        sport: dynamicSportOptions.length > 0 ? dynamicSportOptions : FILTER_OPTIONS.sport
    };

    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [filters, setFilters] = useState<Record<string, string[]>>({
        sport: ['همه'],
        status: ['همه']
    });

    const filterRef = useRef<HTMLDivElement>(null);

    const [isDateModalOpen, setIsDateModalOpen] = useState(false);
    const [dateRange, setDateRange] = useState<DateObject[]>([]);
    const [search, setSearch] = useState('');

    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);

    const [appliedSearch, setAppliedSearch] = useState('');
    const [appliedRange, setAppliedRange] = useState<DateObject[]>([]);
    const [appliedStatus, setAppliedStatus] = useState<string[]>(['همه']);
    const [appliedSport, setAppliedSport] = useState<string[]>(['همه']);

    const [detailsItem, setDetailsItem] = useState<ReservationItem | null>(null);

    const appliedTrendIds = appliedSport.includes('همه')
        ? []
        : appliedSport
            .map(title => apiTrends.find((t: { title: string; gymTrendId: string }) => t.title === title)?.gymTrendId)
            .filter((id): id is string => Boolean(id));

    const { data, isPending, isError } = useReservations({
        pagination: { page, size },
        states: statesForStatusLabels(appliedStatus),
        gymTrendIds: appliedTrendIds,
        search: appliedSearch,
        sessionDateFrom: toGregorianDate(appliedRange[0]),
        sessionDateTo: toGregorianDate(appliedRange[1]),
    });

    const reservations = data?.items ?? [];
    const totalCount = data?.totalCount ?? 0;
    const pageCount = data?.pageCount ?? 0;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const applyFilters = () => {
        setAppliedSearch(search.trim());
        setAppliedRange(dateRange);
        setAppliedStatus(filters.status);
        setAppliedSport(filters.sport);
        setPage(1);
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') applyFilters();
    };

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
                            const isSelected = filters[key].includes('همه') || filters[key].includes(option);
                            return (
                                <div
                                    key={option}
                                    onClick={(e) => { e.stopPropagation(); toggleFilterItem(key, option); }}
                                    className={`flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors ${isSelected ? 'bg-gray-50' : 'hover:bg-gray-50/80'}`}
                                >
                                    <div className={`w-[18px] h-[18px] rounded-[6px] border flex items-center justify-center transition-all shrink-0 ${isSelected ? 'bg-primary-500 border-primary-500 text-white' : 'bg-white border-gray-300'}`}>
                                        {isSelected && <BsCheck size={16} strokeWidth={0.5} />}
                                    </div>
                                    <span className={`text-[13px] ${isSelected ? 'font-bold text-gray-800' : 'font-medium text-gray-600'}`}>
                                        {option}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    const pageNumbers = getPageNumbers(page, pageCount);

    return (
        <div className="min-h-screen bg-gray-50 flex" dir="rtl">
            <Sidebar />

            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <main className="flex-1 p-8 overflow-y-auto max-sm:p-4 bg-[#F8F9FB]">
                    <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
                        <PageHeader title="لیست رزروها" />

                        <div className="bg-white rounded-2xl p-6 border border-gray-100 min-h-[calc(100vh-220px)] flex flex-col relative">
                            <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
                                <div className="relative w-full md:w-[280px]">
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

                                <div className="flex items-center gap-3" dir="ltr">
                                    <button
                                        onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                                        className={`w-[44px] h-[44px] rounded-xl border flex items-center justify-center transition-colors
                                        ${isFiltersOpen ? 'bg-primary-50 border-primary-200 text-primary-600' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                    >
                                        <LuFilter size={20} />
                                    </button>
                                    <div className="h-[44px] px-4 rounded-xl border border-gray-200 bg-gray-50 flex items-center text-[13px] font-medium text-gray-600 shrink-0" dir="rtl">
                                        تعداد کل: {toPersianDigits(totalCount)}
                                    </div>
                                </div>
                            </div>

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
                                        <button
                                            onClick={applyFilters}
                                            className="w-[120px] h-11 bg-primary-500 text-white rounded-full text-[13px] font-bold shadow-[0_4px_12px_rgba(124,77,255,0.25)] hover:bg-primary-600 transition-colors"
                                        >
                                            جستجو
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="overflow-x-auto flex-1">
                                <table className="w-full min-w-[1100px]">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className={`${thClass} w-[8%]`}>نام</th>
                                            <th className={`${thClass} w-[9%]`}>نام خانوادگی</th>
                                            <th className={`${thClass} w-[10%]`}>شماره موبایل</th>
                                            <th className={`${thClass} w-[11%]`}>مبلغ رزرو (تومان)</th>
                                            <th className={`${thClass} w-[9%]`}>تاریخ تولد</th>
                                            <th className={`${thClass} w-[9%]`}>رشته ورزشی</th>
                                            <th className={`${thClass} w-[10%]`}>زمان ورزش</th>
                                            <th className={`${thClass} w-[9%]`}>روز ورزش</th>
                                            <th className={`${thClass} w-[10%]`}>وضعیت رزرو</th>
                                            <th className={`${thClass} w-[9%]`}>تاریخ رزرو</th>
                                            <th className={`${thClass} w-[6%]`}>جزئیات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {isPending ? (
                                            <tr>
                                                <td colSpan={11} className="py-16">
                                                    <div className="flex justify-center">
                                                        <span className="inline-block w-8 h-8 border-[3px] border-primary-200 border-t-primary-500 rounded-full animate-spin" />
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : isError ? (
                                            <tr>
                                                <td colSpan={11} className="py-16 text-center text-[13px] font-medium text-gray-500">
                                                    خطا در دریافت لیست رزروها
                                                </td>
                                            </tr>
                                        ) : reservations.length === 0 ? (
                                            <tr>
                                                <td colSpan={11} className="py-16 text-center text-[13px] font-medium text-gray-500">
                                                    رزروی یافت نشد
                                                </td>
                                            </tr>
                                        ) : (
                                            reservations.map((res, index) => {
                                                const meta = getStatusMeta(res.gymAttendanceState);
                                                const { firstName, lastName } = splitFullName(res.clinetFullName);
                                                return (
                                                    <tr
                                                        key={res.gymAttendanceId}
                                                        className={`transition-colors hover:bg-gray-50/50 ${index !== reservations.length - 1 ? 'border-b border-gray-100' : ''}`}
                                                    >
                                                        <td className={tdClass}>{firstName || '-'}</td>
                                                        <td className={tdClass}>{lastName || '-'}</td>
                                                        <td className={tdClass}>{toPersianDigits(res.clientPhoneNumber || '-')}</td>
                                                        <td className={tdClass}>{formatNumber(res.sessionPrice)}</td>
                                                        <td className={tdClass}>{formatJalali(res.clientBirthDay)}</td>
                                                        <td className={tdClass}>{res.gymTrendTitle || '-'}</td>
                                                        <td className={tdClass} dir="ltr">{formatSessionTime(res.gymStart, res.gymEnd, res.gymTimeType)}</td>
                                                        <td className={tdClass}>{formatJalali(res.sessionDate)}</td>
                                                        <td className={tdClass}>
                                                            <span className={`inline-flex items-center justify-center px-3 py-1 rounded-lg text-[12px] font-medium ${meta.style}`}>
                                                                {meta.label}
                                                            </span>
                                                        </td>
                                                        <td className={tdClass}>{formatJalali(res.createdMoment)}</td>
                                                        <td className={tdClass}>
                                                            <button
                                                                onClick={() => setDetailsItem(res)}
                                                                className="px-3.5 py-1.5 rounded-lg border border-gray-200 bg-white text-[12px] font-medium text-gray-600 hover:border-primary-200 hover:text-primary-600 transition-colors"
                                                            >
                                                                بیشتر
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {!isPending && !isError && reservations.length > 0 && (
                                <div className="flex items-center justify-between mt-8 mb-2">
                                    <div className="flex items-center gap-2 text-[13px]">
                                        <span className="text-gray-500">تعداد نمایش:</span>
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

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page <= 1}
                                            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            <BsChevronRight size={12} />
                                        </button>
                                        {pageNumbers.map((pageNum, idx) => (
                                            typeof pageNum === 'number' ? (
                                                <button
                                                    key={idx}
                                                    onClick={() => setPage(pageNum)}
                                                    className={`w-8 h-8 rounded-full text-[13px] font-bold transition-colors ${
                                                        pageNum === page
                                                            ? 'bg-primary-500 text-white'
                                                            : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                                                    }`}
                                                    dir="ltr"
                                                >
                                                    {toPersianDigits(pageNum)}
                                                </button>
                                            ) : (
                                                <span key={idx} className="w-8 h-8 flex items-center justify-center text-[13px] font-bold text-gray-400">…</span>
                                            )
                                        ))}
                                        <button
                                            onClick={() => setPage(p => Math.min(pageCount, p + 1))}
                                            disabled={page >= pageCount}
                                            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            <BsChevronLeft size={12} />
                                        </button>
                                    </div>
                                </div>
                            )}
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

            <DetailsModal
                isOpen={!!detailsItem}
                onClose={() => setDetailsItem(null)}
                title="جزئیات رزرو"
                details={detailsItem ? [
                    { label: 'نام کاربر', value: detailsItem.clinetFullName || '-' },
                    { label: 'شماره موبایل', value: toPersianDigits(detailsItem.clientPhoneNumber || '-') },
                    { label: 'تاریخ تولد', value: formatJalali(detailsItem.clientBirthDay) },
                    { label: 'رشته ورزشی', value: detailsItem.gymTrendTitle || '-' },
                    { label: 'تاریخ', value: formatJalali(detailsItem.sessionDate) },
                    { label: 'ساعت', value: <span dir="ltr">{formatSessionTime(detailsItem.gymStart, detailsItem.gymEnd)}</span> },
                    { label: 'مبلغ پرداختی', value: formatToman(detailsItem.sessionPrice) },
                    { label: 'وضعیت رزرو', value: getStatusMeta(detailsItem.gymAttendanceState).label },
                ] : []}
            />
        </div>
    );
}
