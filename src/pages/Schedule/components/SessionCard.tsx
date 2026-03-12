import type { RefObject } from 'react';
import { HiOutlineTrash, HiOutlineX } from 'react-icons/hi';
import RadialTimePicker from '../../../components/ui/RadialTimePicker';
import type { LocalSession } from '../types';

interface SessionCardProps {
    session: LocalSession;
    index: number;
    activePicker: string | null;
    setActivePicker: (pickerId: string | null) => void;
    pickerRef: RefObject<HTMLDivElement | null>;
    updateSession: (clientId: string, updates: Partial<LocalSession>) => void;
    confirmDelete: (clientId: string) => void;
    toggleAllDays: (clientId: string, checked: boolean) => void;
}

export default function SessionCard({
    session,
    index,
    activePicker,
    setActivePicker,
    pickerRef,
    updateSession,
    confirmDelete,
    toggleAllDays
}: SessionCardProps) {
    const formatPriceDisplay = (val: string) => {
        if (!val) return '';
        return Number(val).toLocaleString('fa-IR');
    };

    const isBackend = !!session.id;

    return (
        <div className="bg-white border-[1.5px] border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-[14px] p-5 flex flex-col gap-3 relative">
            {/* Card Header */}
            <div className="flex justify-between items-center mb-1 border-b border-gray-50 pb-2">
                <button
                    onClick={() => confirmDelete(session._clientId)}
                    className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                >
                    <HiOutlineTrash size={17} />
                </button>

                <div className="w-[26px] h-[26px] rounded-full border-2 border-primary-200 text-primary-500 flex items-center justify-center text-xs font-bold bg-primary-50/50">
                    {index + 1}
                </div>
            </div>

            {/* From Time Input */}
            <div className="relative">
                <div
                    onClick={() => !isBackend && setActivePicker(`${session._clientId}-from`)}
                    className={`flex items-center w-full px-3.5 py-3 border-[1.5px] rounded-[10px] transition-colors ${isBackend ? 'bg-gray-50 cursor-default opacity-80' : 'bg-white cursor-pointer hover:border-gray-300'} ${activePicker === `${session._clientId}-from` ? 'border-primary-400 ring-2 ring-primary-50' : 'border-gray-100'}`}
                >
                    <input
                        type="text"
                        readOnly
                        value={session.fromTime}
                        placeholder="00:00"
                        className="w-full bg-transparent outline-none text-right text-[13px] font-bold text-gray-800 placeholder:text-gray-300 cursor-pointer pointer-events-none"
                        dir="ltr"
                    />
                    <div className="flex items-center gap-2 pr-2 shrink-0 border-r border-gray-100">
                        {session.fromTime && !isBackend && (
                            <HiOutlineX
                                size={16}
                                className="text-gray-400 hover:text-red-500 pointer-events-auto cursor-pointer"
                                onClick={(e) => { e.stopPropagation(); updateSession(session._clientId, { fromTime: '' }); }}
                            />
                        )}
                    </div>
                </div>
                {activePicker === `${session._clientId}-from` && (
                    <div ref={pickerRef} className="absolute top-[60px] left-1/2 -translate-x-1/2 z-[99]">
                        <RadialTimePicker value={session.fromTime} onChange={(v) => updateSession(session._clientId, { fromTime: v })} />
                    </div>
                )}
            </div>

            {/* To Time Input */}
            <div className="relative">
                <div
                    onClick={() => !isBackend && setActivePicker(`${session._clientId}-to`)}
                    className={`flex items-center w-full px-3.5 py-3 border-[1.5px] rounded-[10px] transition-colors ${isBackend ? 'bg-gray-50 cursor-default opacity-80' : 'bg-white cursor-pointer hover:border-gray-300'} ${activePicker === `${session._clientId}-to` ? 'border-primary-400 ring-2 ring-primary-50' : 'border-gray-100'}`}
                >
                    <input
                        type="text"
                        readOnly
                        value={session.toTime}
                        placeholder="00:00"
                        className="w-full bg-transparent outline-none text-right text-[13px] font-bold text-gray-800 placeholder:text-gray-300 cursor-pointer pointer-events-none"
                        dir="ltr"
                    />
                    <div className="flex items-center gap-2 pr-2 shrink-0 border-r border-gray-100">
                        {session.toTime && !isBackend && (
                            <HiOutlineX
                                size={16}
                                className="text-gray-400 hover:text-red-500 pointer-events-auto cursor-pointer"
                                onClick={(e) => { e.stopPropagation(); updateSession(session._clientId, { toTime: '' }); }}
                            />
                        )}
                    </div>
                </div>
                {activePicker === `${session._clientId}-to` && (
                    <div ref={pickerRef} className="absolute top-[60px] left-1/2 -translate-x-1/2 z-[99]">
                        <RadialTimePicker value={session.toTime} onChange={(v) => updateSession(session._clientId, { toTime: v })} />
                    </div>
                )}
            </div>

            {/* Gender Selection */}
            <div className={`flex bg-gray-50 border-[1.5px] border-gray-100 p-1 rounded-[10px] w-full mt-1 mb-1 ${isBackend ? 'opacity-80' : ''}`}>
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

            {/* Capacity */}
            <div className={`flex items-center w-full px-3.5 py-[9px] border-[1.5px] border-gray-100 rounded-[10px] transition-colors focus-within:border-primary-400 ${isBackend ? 'bg-gray-50 opacity-80' : 'bg-white'}`}>
                <input
                    type="number"
                    disabled={isBackend}
                    value={session.capacity}
                    onChange={(e) => updateSession(session._clientId, { capacity: e.target.value })}
                    className={`w-full min-w-0 bg-transparent outline-none text-right text-[13px] font-bold text-gray-800 ${isBackend ? 'cursor-default' : ''}`}
                    dir="ltr"
                />
                <div className="flex items-center shrink-0 pr-2.5">
                    <span className="text-[12px] text-gray-400 font-medium ml-2">نفر</span>
                    {session.capacity !== '' && !isBackend && (
                        <HiOutlineX
                            size={15}
                            className="text-gray-300 hover:text-red-500 cursor-pointer"
                            onClick={() => updateSession(session._clientId, { capacity: '' })}
                        />
                    )}
                </div>
            </div>

            {/* Price */}
            <div className="flex flex-col gap-1.5 pt-1">
                <div className={`flex items-center w-full px-3.5 py-[9px] border-[1.5px] rounded-[10px] transition-colors focus-within:border-primary-400 border-gray-100 ${isBackend ? 'bg-gray-50 opacity-80' : 'bg-white'}`}
                >
                    <input
                        type="text"
                        disabled={isBackend}
                        value={formatPriceDisplay(session.price)}
                        onChange={(e) => {
                            const val = e.target.value;
                            const englishFormatted = val
                                .replace(/[۰-۹]/g, d => '0123456789'[d.charCodeAt(0) - 1776])
                                .replace(/[٠-٩]/g, d => '0123456789'[d.charCodeAt(0) - 1632])
                                .replace(/\D/g, '');
                            updateSession(session._clientId, { price: englishFormatted });
                        }}
                        className={`w-full min-w-0 bg-transparent outline-none text-right text-[13px] font-bold text-gray-800 ${isBackend ? 'cursor-default' : ''}`}
                        dir="ltr"
                    />
                    <div className="flex items-center shrink-0 pr-2.5">
                        <span className="text-[11px] text-gray-400 font-medium ml-2">تومان</span>
                        {session.price !== '' && !isBackend && (
                            <HiOutlineX
                                size={15}
                                className="text-gray-300 hover:text-red-500 cursor-pointer"
                                onClick={() => updateSession(session._clientId, { price: '' })}
                            />
                        )}
                    </div>
                </div>
                {/* {session.price && (Number(session.price) < 500000 || Number(session.price) > 2000000) && (
                    <span className="text-[10px] text-red-500 font-medium text-right pr-1">بازه قیمتی این رشته ۵۰۰,۰۰۰ تا ۲,۰۰۰,۰۰۰ تومان</span>
                )} */}
            </div>

            {/* Apply to All Days Checkbox */}
            {!isBackend && (
                <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer w-fit group">
                        <div className={`w-[14px] h-[14px] rounded-[4px] border flex items-center justify-center transition-colors 
                    ${session.applyAllDays ? 'bg-primary-500 border-primary-500' : 'bg-transparent border-gray-300 group-hover:border-gray-400'}`}>
                            {session.applyAllDays && (
                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                        <input
                            type="checkbox"
                            checked={session.applyAllDays || false}
                            onChange={(e) => toggleAllDays(session._clientId, e.target.checked)}
                            className="hidden"
                        />
                        <span className="text-[10px] font-medium text-gray-400 select-none">تنظیم برای تمام روزهای هفته</span>
                    </label>
                </div>
            )}
        </div>
    );
}
