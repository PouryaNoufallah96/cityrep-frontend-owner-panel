import type { RefObject } from 'react';
import { HiOutlineChevronDown, HiOutlineTrash, HiOutlineX } from 'react-icons/hi';
import RadialTimePicker from '../../../components/ui/RadialTimePicker';
import type { LocalSession } from '../types';
import type { SessionPriceBand } from '../../../services/gymService';
import { toPersianDigits } from '../../../utils/format';

interface SessionCardProps {
    session: LocalSession;
    index: number;
    activePicker: string | null;
    setActivePicker: (pickerId: string | null) => void;
    pickerRef: RefObject<HTMLDivElement | null>;
    updateSession: (clientId: string, updates: Partial<LocalSession>) => void;
    confirmDelete: (clientId: string) => void;
    toggleAllDays: (clientId: string, checked: boolean) => void;
    priceBand?: SessionPriceBand;
}

export default function SessionCard({
    session,
    index,
    activePicker,
    setActivePicker,
    pickerRef,
    updateSession,
    confirmDelete,
    toggleAllDays,
    priceBand
}: SessionCardProps) {
    const formatPriceDisplay = (val: string) => {
        if (!val) return '';
        return toPersianDigits(Number(val).toLocaleString('en-US'));
    };

    const isBackend = !!session.id;
    const applyAllChecked = !!(session.applyAllDays || session._clonedFrom);

    const priceValue = Number(session.price);
    const isPriceOutOfRange =
        !isBackend && !!session.price && !!priceBand && (priceValue < priceBand.fromPrice || priceValue > priceBand.toPrice);

    const fieldShell = (active: boolean, error = false) =>
        `flex items-center w-full px-3.5 py-[11px] border rounded-[10px] transition-colors ${
            isBackend ? 'bg-gray-50 cursor-default opacity-80' : 'bg-white cursor-pointer hover:border-gray-300'
        } ${
            error
                ? 'border-red-400'
                : active
                    ? 'border-primary-400 ring-2 ring-primary-50'
                    : 'border-gray-200'
        }`;

    return (
        <div className="bg-white border border-gray-100 rounded-[14px] p-4 flex flex-col gap-2.5 relative shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="flex justify-between items-center mb-0.5">
                <div className="w-[26px] h-[26px] rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold">
                    {toPersianDigits(index + 1)}
                </div>

                <button
                    onClick={() => confirmDelete(session._clientId)}
                    className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                >
                    <HiOutlineTrash size={17} />
                </button>
            </div>

            <div className="relative">
                <div
                    onClick={() => !isBackend && setActivePicker(`${session._clientId}-from`)}
                    className={fieldShell(activePicker === `${session._clientId}-from`)}
                >
                    <input
                        type="text"
                        readOnly
                        value={session.fromTime ? toPersianDigits(session.fromTime) : ''}
                        placeholder="از ساعت"
                        className="w-full bg-transparent outline-none text-right text-[13px] font-medium text-gray-800 placeholder:text-gray-400 cursor-pointer pointer-events-none"
                        dir="rtl"
                    />
                    <div className="flex items-center shrink-0 pl-0.5">
                        {session.fromTime && !isBackend ? (
                            <HiOutlineX
                                size={16}
                                className="text-gray-400 hover:text-red-500 pointer-events-auto cursor-pointer"
                                onClick={(e) => { e.stopPropagation(); updateSession(session._clientId, { fromTime: '' }); }}
                            />
                        ) : (
                            <HiOutlineChevronDown size={16} className="text-gray-400" />
                        )}
                    </div>
                </div>
                {activePicker === `${session._clientId}-from` && (
                    <div ref={pickerRef} className="absolute top-[52px] left-1/2 -translate-x-1/2 z-[99]">
                        <RadialTimePicker value={session.fromTime} onChange={(v) => updateSession(session._clientId, { fromTime: v })} />
                    </div>
                )}
            </div>

            <div className="relative">
                <div
                    onClick={() => !isBackend && setActivePicker(`${session._clientId}-to`)}
                    className={fieldShell(activePicker === `${session._clientId}-to`)}
                >
                    <input
                        type="text"
                        readOnly
                        value={session.toTime ? toPersianDigits(session.toTime) : ''}
                        placeholder="تا ساعت"
                        className="w-full bg-transparent outline-none text-right text-[13px] font-medium text-gray-800 placeholder:text-gray-400 cursor-pointer pointer-events-none"
                        dir="rtl"
                    />
                    <div className="flex items-center shrink-0 pl-0.5">
                        {session.toTime && !isBackend ? (
                            <HiOutlineX
                                size={16}
                                className="text-gray-400 hover:text-red-500 pointer-events-auto cursor-pointer"
                                onClick={(e) => { e.stopPropagation(); updateSession(session._clientId, { toTime: '' }); }}
                            />
                        ) : (
                            <HiOutlineChevronDown size={16} className="text-gray-400" />
                        )}
                    </div>
                </div>
                {activePicker === `${session._clientId}-to` && (
                    <div ref={pickerRef} className="absolute top-[52px] left-1/2 -translate-x-1/2 z-[99]">
                        <RadialTimePicker value={session.toTime} onChange={(v) => updateSession(session._clientId, { toTime: v })} />
                    </div>
                )}
            </div>

            <div className={`flex bg-gray-50 border border-gray-200 p-1 rounded-[10px] w-full ${isBackend ? 'opacity-80' : ''}`}>
                <button
                    disabled={isBackend}
                    onClick={() => updateSession(session._clientId, { gender: 'men' })}
                    className={`flex-1 py-1.5 text-[12px] font-bold rounded-[7px] transition-all ${session.gender === 'men' ? 'bg-white text-gray-800 shadow-sm border border-gray-100/50' : 'text-gray-400 hover:text-gray-600'} ${isBackend ? 'cursor-default' : ''}`}
                >
                    مردانه
                </button>
                <div className="w-[1px] bg-gray-200/60 my-2 mx-0.5"></div>
                <button
                    disabled={isBackend}
                    onClick={() => updateSession(session._clientId, { gender: 'both' })}
                    className={`flex-1 py-1.5 text-[12px] font-bold rounded-[7px] transition-all ${session.gender === 'both' ? 'bg-white text-gray-800 shadow-sm border border-gray-100/50' : 'text-gray-400 hover:text-gray-600'} ${isBackend ? 'cursor-default' : ''}`}
                >
                    هردو
                </button>
                <div className="w-[1px] bg-gray-200/60 my-2 mx-0.5"></div>
                <button
                    disabled={isBackend}
                    onClick={() => updateSession(session._clientId, { gender: 'women' })}
                    className={`flex-1 py-1.5 text-[12px] font-bold rounded-[7px] transition-all ${session.gender === 'women' ? 'bg-white text-gray-800 shadow-sm border border-gray-100/50' : 'text-gray-400 hover:text-gray-600'} ${isBackend ? 'cursor-default' : ''}`}
                >
                    زنانه
                </button>
            </div>

            <div className={`flex items-center w-full px-3.5 py-[11px] border rounded-[10px] transition-colors focus-within:border-primary-400 ${isBackend ? 'bg-gray-50 opacity-80 border-gray-200' : 'bg-white border-gray-200'}`}>
                <input
                    type="text"
                    inputMode="numeric"
                    disabled={isBackend}
                    value={session.capacity ? toPersianDigits(session.capacity) : ''}
                    placeholder="ظرفیت"
                    onChange={(e) => {
                        const english = e.target.value
                            .replace(/[۰-۹]/g, d => '0123456789'[d.charCodeAt(0) - 1776])
                            .replace(/[٠-٩]/g, d => '0123456789'[d.charCodeAt(0) - 1632])
                            .replace(/\D/g, '');
                        updateSession(session._clientId, { capacity: english });
                    }}
                    className={`w-full min-w-0 bg-transparent outline-none text-right text-[13px] font-medium text-gray-800 placeholder:text-gray-400 ${isBackend ? 'cursor-default' : ''}`}
                    dir="rtl"
                />
                <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[12px] text-gray-400 font-medium">نفر</span>
                    {session.capacity !== '' && !isBackend && (
                        <HiOutlineX
                            size={15}
                            className="text-gray-300 hover:text-red-500 cursor-pointer"
                            onClick={() => updateSession(session._clientId, { capacity: '' })}
                        />
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <div className={`flex items-center w-full px-3.5 py-[11px] border rounded-[10px] transition-colors ${isPriceOutOfRange ? 'border-red-400' : 'border-gray-200 focus-within:border-primary-400'} ${isBackend ? 'bg-gray-50 opacity-80' : 'bg-white'}`}>
                    <input
                        type="text"
                        disabled={isBackend}
                        value={formatPriceDisplay(session.price)}
                        placeholder="مبلغ"
                        onChange={(e) => {
                            const englishFormatted = e.target.value
                                .replace(/[۰-۹]/g, d => '0123456789'[d.charCodeAt(0) - 1776])
                                .replace(/[٠-٩]/g, d => '0123456789'[d.charCodeAt(0) - 1632])
                                .replace(/\D/g, '');
                            updateSession(session._clientId, { price: englishFormatted });
                        }}
                        className={`w-full min-w-0 bg-transparent outline-none text-right text-[13px] font-medium text-gray-800 placeholder:text-gray-400 ${isBackend ? 'cursor-default' : ''}`}
                        dir="rtl"
                    />
                    <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[11px] text-gray-400 font-medium">تومان</span>
                        {session.price !== '' && !isBackend && (
                            <HiOutlineX
                                size={15}
                                className="text-gray-300 hover:text-red-500 cursor-pointer"
                                onClick={() => updateSession(session._clientId, { price: '' })}
                            />
                        )}
                    </div>
                </div>
                {isPriceOutOfRange && priceBand && (
                    <span className="text-[10px] text-red-500 font-medium text-right pr-1">
                        بازه قیمتی این رشته {toPersianDigits(priceBand.fromPrice.toLocaleString('en-US'))} تا {toPersianDigits(priceBand.toPrice.toLocaleString('en-US'))} تومان
                    </span>
                )}
            </div>

            <div className="pt-1">
                <label className={`flex items-center gap-2 w-fit group ${isBackend ? 'cursor-default' : 'cursor-pointer'}`}>
                    <div className={`w-[14px] h-[14px] rounded-[3px] border flex items-center justify-center transition-colors
                ${!isBackend && applyAllChecked ? 'bg-primary-500 border-primary-500' : 'bg-transparent border-gray-300'}
                ${!isBackend ? 'group-hover:border-gray-400' : ''}`}>
                        {!isBackend && applyAllChecked && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                    </div>
                    {!isBackend && (
                        <input
                            type="checkbox"
                            checked={applyAllChecked}
                            onChange={(e) => toggleAllDays(session._clientId, e.target.checked)}
                            className="hidden"
                        />
                    )}
                    <span className="text-[10px] font-medium text-gray-400 select-none">تنظیم برای تمام روزهای هفته</span>
                </label>
            </div>
        </div>
    );
}
