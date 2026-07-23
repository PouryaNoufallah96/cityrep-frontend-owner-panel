import { useState, useRef, useEffect } from 'react';
import { HiOutlinePlus } from 'react-icons/hi';
import Sidebar from '../../components/layout/Sidebar';
import PageHeader from '../../components/layout/PageHeader';
import { scheduleService } from '../../services/scheduleService';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { toast } from 'react-toastify';
import { WEEK_DAYS } from './constants';
import type { LocalSession } from './types';
import TrendTabs from './components/TrendTabs';
import SessionCard from './components/SessionCard';
import SaveOptionsModal from './components/SaveOptionsModal';
import { useGyms, useSessionPriceBand } from '../../hooks/useGym';
import { toPersianDigits } from '../../utils/format';

export default function SchedulePage() {
    const { data: gymsResponse, isLoading: isGymsLoading } = useGyms();
    const { data: priceBand } = useSessionPriceBand();
    const gym = gymsResponse?.data?.data?.[0];
    const gymId = gym?.gymId || '';

    const trends = gym?.trends
        ?.filter(t => t.isActive)
        .map(t => ({
            id: t.gymTrendId,
            title: t.title,
            iconUrl: t.trendIconUrl ? `${import.meta.env.VITE_BASE_API}/File/DownloadFile/${t.trendIconUrl}` : undefined,
        })) || [];

    const [selectedTrend, setSelectedTrend] = useState('');
    const [localSessions, setLocalSessions] = useState<LocalSession[]>([]);
    const [loadedTrends, setLoadedTrends] = useState<Set<string>>(new Set());
    const [isLoadingSessions, setIsLoadingSessions] = useState(false);

    const [activePicker, setActivePicker] = useState<string | null>(null);
    const pickerRef = useRef<HTMLDivElement>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; sessionObj: LocalSession | null }>({
        isOpen: false,
        sessionObj: null
    });
    const [saveModalOpen, setSaveModalOpen] = useState(false);

    const loadSessions = async (trendToLoad: string) => {
        if (!gymId) return;
        setIsLoadingSessions(true);
        setLoadedTrends(prev => new Set(prev).add(trendToLoad));
        try {
            const data = await scheduleService.getSessions(gymId, [trendToLoad]);

            const mergedMap = new Map();
            data.forEach(s => {
                const key = `${s.dayOfWeek}-${s.trendId}-${s.fromTime}-${s.toTime}`;
                if (mergedMap.has(key)) {
                    const existing = mergedMap.get(key);
                    if ((existing.gender === 'men' && s.gender === 'women') || (existing.gender === 'women' && s.gender === 'men')) {
                        existing.gender = 'both';
                        existing.pairedId = s.id;
                    }
                } else {
                    mergedMap.set(key, { ...s });
                }
            });

            const local = Array.from(mergedMap.values()).map(s => ({
                _clientId: Math.random().toString(36).substring(7),
                id: s.id,
                pairedId: s.pairedId,
                dayOfWeek: s.dayOfWeek,
                trendId: s.trendId,
                fromTime: s.fromTime,
                toTime: s.toTime,
                capacity: String(s.capacity),
                price: String(s.price),
                gender: s.gender || 'both',
                applyAllDays: false
            }));
            setLocalSessions(prev => [...prev.filter(s => s.trendId !== trendToLoad), ...local]);
            setIsLoadingSessions(false)
        } catch {
            setLoadedTrends(prev => {
                const next = new Set(prev);
                next.delete(trendToLoad);
                return next;
            });
            setIsLoadingSessions(false)
            toast.error('خطا در بارگزاری سانس‌ها');
        }
    };

    const handleSelectTrend = (trendId: string) => {
        setSelectedTrend(trendId);
        if (!loadedTrends.has(trendId) && gymId) {
            loadSessions(trendId);
        }
    };

    const handleAddSession = (dayId: number) => {
        if (!selectedTrend) {
            toast.info('ابتدا یک رشته را انتخاب کنید.');
            return;
        }
        setLocalSessions(prev => [
            ...prev,
            {
                _clientId: Math.random().toString(36).substring(7),
                dayOfWeek: dayId,
                trendId: selectedTrend,
                fromTime: '',
                toTime: '',
                capacity: '',
                price: '',
                gender: 'both',
                applyAllDays: false
            }
        ]);
    };

    const updateSession = (clientId: string, updates: Partial<LocalSession>) => {
        const currentSession = localSessions.find(s => s._clientId === clientId);
        if (!currentSession) return;

        if (updates.fromTime !== undefined || updates.toTime !== undefined) {
            const newFrom = updates.fromTime !== undefined ? updates.fromTime : currentSession.fromTime;
            const newTo = updates.toTime !== undefined ? updates.toTime : currentSession.toTime;

            if (newFrom && newTo && newFrom >= newTo) {
                toast.error('زمان پایان باید پس از زمان شروع باشد.', { toastId: 'session-time-order' });
                return;
            }

            if (newFrom && newTo) {
                const sourceId = currentSession._clonedFrom || currentSession._clientId;
                const linked = (s: LocalSession) =>
                    s._clientId === sourceId || s._clonedFrom === sourceId || s._clientId === clientId;

                const affectedDays = (currentSession.applyAllDays || currentSession._clonedFrom)
                    ? WEEK_DAYS.map(d => d.id)
                    : [currentSession.dayOfWeek];

                const hasConflict = localSessions.some(s => {
                    if (linked(s)) return false;

                    if (s.trendId === currentSession.trendId && affectedDays.includes(s.dayOfWeek)) {
                        if (s.fromTime && s.toTime) {
                            return (newFrom < s.toTime && s.fromTime < newTo);
                        }
                    }
                    return false;
                });

                if (hasConflict) {
                    toast.error('این زمان با سانس‌های دیگر تداخل دارد.', { toastId: 'session-time-conflict' });
                    return;
                }
            }
        }

        setLocalSessions(prev => {
            let next = prev.map(s => s._clientId === clientId ? { ...s, ...updates } : s);
            const edited = next.find(s => s._clientId === clientId);
            if (!edited) return next;

            const sourceId = edited._clonedFrom || edited._clientId;
            if (edited.applyAllDays || edited._clonedFrom) {
                next = next.map(s => {
                    if (s._clientId === sourceId || s._clonedFrom === sourceId) {
                        return {
                            ...s,
                            ...(updates.fromTime !== undefined && { fromTime: updates.fromTime }),
                            ...(updates.toTime !== undefined && { toTime: updates.toTime }),
                            ...(updates.capacity !== undefined && { capacity: updates.capacity }),
                            ...(updates.price !== undefined && { price: updates.price }),
                            ...(updates.gender !== undefined && { gender: updates.gender })
                        };
                    }
                    return s;
                });
            }
            return next;
        });
    };

    const handleToggleAllDays = (clientId: string, checked: boolean) => {
        const clicked = localSessions.find(s => s._clientId === clientId);
        if (!clicked) return;

        const sourceId = clicked._clonedFrom || clicked._clientId;
        const source = localSessions.find(s => s._clientId === sourceId);
        if (!source) return;

        if (checked && source.fromTime && source.toTime) {
            const hasConflict = WEEK_DAYS.some(day => {
                if (day.id === source.dayOfWeek) return false;
                return localSessions.some(s =>
                    s.dayOfWeek === day.id &&
                    s.trendId === source.trendId &&
                    !s._clonedFrom &&
                    s._clientId !== sourceId &&
                    s.fromTime && s.toTime &&
                    source.fromTime! < s.toTime && s.fromTime < source.toTime!
                );
            });

            if (hasConflict) {
                toast.error('ثبت برای تمام روزها با سانس‌های دیگر تداخل دارد.', { toastId: 'alldays-conflict' });
                return;
            }
        }

        setLocalSessions(prev => {
            const updated = prev.filter(s => !(s._clonedFrom === sourceId && !s.id));
            const sourceIdx = updated.findIndex(s => s._clientId === sourceId);
            if (sourceIdx === -1) return prev;

            updated[sourceIdx] = { ...updated[sourceIdx], applyAllDays: checked };

            if (checked) {
                const src = updated[sourceIdx];
                WEEK_DAYS.forEach(day => {
                    if (day.id !== src.dayOfWeek) {
                        updated.push({
                            _clientId: Math.random().toString(36).substring(7),
                            dayOfWeek: day.id,
                            trendId: src.trendId,
                            fromTime: src.fromTime,
                            toTime: src.toTime,
                            capacity: src.capacity,
                            price: src.price,
                            gender: src.gender,
                            applyAllDays: true,
                            _clonedFrom: sourceId
                        });
                    }
                });
            }
            return updated;
        });
    };

    const confirmDelete = (clientId: string) => {
        const session = localSessions.find(s => s._clientId === clientId);
        if (session) {
            setDeleteModal({ isOpen: true, sessionObj: session });
        }
    };

    const removeSession = async () => {
        if (!deleteModal.sessionObj) return;
        const clientId = deleteModal.sessionObj._clientId;
        const session = localSessions.find(s => s._clientId === clientId);

        if (session?.id && gymId) {
            try {
                await scheduleService.deleteSession(gymId, session.trendId, session.id);
                if (session.pairedId) {
                    await scheduleService.deleteSession(gymId, session.trendId, session.pairedId);
                }
            } catch {
                toast.error('خطا در حذف سانس');
                setDeleteModal({ isOpen: false, sessionObj: null });
                return;
            }
        }
        setLocalSessions(prev => prev.filter(s =>
            s._clientId !== clientId && s._clonedFrom !== clientId
        ));
        toast.success('حذف سانس با موفقیت انجام شد.');
        setDeleteModal({ isOpen: false, sessionObj: null });
    };

    const handlePreSave = () => {
        const unsavedAll = localSessions.filter(s => !s.id);
        const unsavedOther = unsavedAll.filter(s => s.trendId !== selectedTrend);

        if (unsavedAll.length === 0) {
            toast.info('تغییر جدیدی برای ثبت وجود ندارد.');
            return;
        }

        if (unsavedOther.length > 0) {
            setSaveModalOpen(true);
        } else {
            handlePerformSave(true);
        }
    };

    const handlePerformSave = async (onlyCurrent: boolean) => {
        setIsSaving(true);
        try {
            let changesToSave = localSessions.filter(s => !s.id);
            if (onlyCurrent) {
                changesToSave = changesToSave.filter(s => s.trendId === selectedTrend);
            }

            if (changesToSave.length === 0) {
                toast.info('تغییر جدیدی برای ثبت وجود ندارد.');
                setIsSaving(false);
                return;
            }

            if (!gymId) {
                toast.error('اطلاعات باشگاه یافت نشد.');
                setIsSaving(false);
                return;
            }

            const incomplete = changesToSave.some(s => !s.fromTime || !s.toTime || !s.capacity || !s.price);
            if (incomplete) {
                toast.error('لطفا تمام فیلدهای سانس‌های جدید را تکمیل کنید.');
                setIsSaving(false);
                return;
            }

            if (priceBand) {
                const outOfRange = changesToSave.some(s => {
                    const price = Number(s.price);
                    return price < priceBand.fromPrice || price > priceBand.toPrice;
                });
                if (outOfRange) {
                    toast.error('مبلغ یکی از سانس‌ها خارج از بازه مجاز است.');
                    setIsSaving(false);
                    return;
                }
            }

            const activeTrendIds = new Set(changesToSave.map(s => s.trendId));

            for (const trendId of activeTrendIds) {
                const sessionsForTrend = changesToSave.filter(s => s.trendId === trendId);

                const iSessions = sessionsForTrend.map(s => ({
                    id: '',
                    dayOfWeek: s.dayOfWeek,
                    trendId: s.trendId,
                    fromTime: s.fromTime,
                    toTime: s.toTime,
                    capacity: Number(s.capacity),
                    price: Number(s.price),
                    gender: s.gender as 'men' | 'women' | 'both'
                }));

                await scheduleService.addSessionsForTrend(gymId, trendId, iSessions);
            }

            toast.success('تغییرات بخش افزودن سانس با موفقیت ثبت شد.');

            if (onlyCurrent) {
                setLoadedTrends(prev => {
                    const next = new Set(prev);
                    next.delete(selectedTrend);
                    return next;
                });
                if (selectedTrend) {
                    await loadSessions(selectedTrend);
                }
            } else {
                setLoadedTrends(new Set());
                setLocalSessions([]);
                if (selectedTrend) {
                    await loadSessions(selectedTrend);
                }
            }
        } catch {
            toast.error('خطا در ثبت تغییرات');
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
                setActivePicker(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex" dir="rtl">
            <Sidebar />

            <div className="flex-1 flex flex-col h-screen overflow-hidden">


                <main className="flex-1 overflow-y-auto p-6 max-sm:p-4 bg-gray-50 relative z-10">
                    <div className="max-w-[1200px] mx-auto flex flex-col gap-5 h-full">

                        <PageHeader title="مدیریت زمان‌بندی" />

                        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 flex flex-col flex-1 min-h-0">

                            <TrendTabs
                                trends={trends}
                                selectedTrend={selectedTrend}
                                setSelectedTrend={handleSelectTrend}
                            />

                            {(isGymsLoading || (selectedTrend && isLoadingSessions)) ? (
                                <div className="flex-1 flex flex-col items-center justify-center min-h-[360px] pb-6 border-b border-gray-100">
                                    <div className="w-10 h-10 border-[3.5px] border-gray-100 border-t-primary-500 rounded-full animate-spin mb-4"></div>
                                    <span className="text-[13px] text-gray-400 font-medium tracking-wide">در حال دریافت اطلاعات...</span>
                                </div>
                            ) : (
                                <div className="flex-1 overflow-x-auto overflow-y-auto pb-4 border-b border-gray-100 custom-scrollbar relative flex min-h-[360px]">
                                    <div className="flex min-w-max flex-1 pb-4 bg-[#F8F8F8] rounded-xl">
                                        {WEEK_DAYS.map((day, index) => {
                                            const daySessions = selectedTrend
                                                ? localSessions.filter(s => s.dayOfWeek === day.id && s.trendId === selectedTrend)
                                                : [];

                                            return (
                                                <div
                                                    key={day.id}
                                                    className={`w-[248px] shrink-0 flex flex-col px-3 ${index > 0 ? 'border-r border-[#E8E8E8]' : ''}`}
                                                >
                                                    <h3 className="text-[13px] font-bold text-gray-500 text-center mb-4 pt-4">
                                                        {day.name}
                                                    </h3>

                                                    <div className="flex flex-col gap-3 pb-4">
                                                        <button
                                                            onClick={() => handleAddSession(day.id)}
                                                            className="w-full py-3.5 border border-dashed border-primary-300 rounded-xl text-primary-500 text-[12.5px] font-bold flex items-center justify-center gap-1.5 bg-white hover:bg-primary-50 transition-all duration-200"
                                                        >
                                                            <HiOutlinePlus size={16} className="text-primary-500" />
                                                            افزودن سانس
                                                        </button>

                                                        {daySessions.map((session, sIndex) => (
                                                            <SessionCard
                                                                key={session._clientId}
                                                                session={session}
                                                                index={sIndex}
                                                                activePicker={activePicker}
                                                                setActivePicker={setActivePicker}
                                                                pickerRef={pickerRef}
                                                                updateSession={updateSession}
                                                                confirmDelete={confirmDelete}
                                                                toggleAllDays={handleToggleAllDays}
                                                                priceBand={priceBand}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="pt-5 flex items-center justify-end shrink-0">
                                <button
                                    onClick={handlePreSave}
                                    disabled={isSaving}
                                    className="px-10 py-3.5 bg-primary-500 text-white rounded-full text-[13px] font-bold hover:bg-primary-600 transition-colors outline-none disabled:opacity-70 disabled:cursor-wait"
                                >
                                    {isSaving ? 'در حال ثبت...' : 'ثبت تغییرات'}
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <SaveOptionsModal
                isOpen={saveModalOpen}
                onClose={() => setSaveModalOpen(false)}
                onSaveCurrent={() => handlePerformSave(true)}
                onSaveAll={() => handlePerformSave(false)}
                hasOtherChanges={localSessions.filter(s => !s.id && s.trendId !== selectedTrend).length > 0}
            />

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, sessionObj: null })}
                onConfirm={removeSession}
                title="حذف سانس"
                confirmText="حذف"
                cancelText="انصراف"
                isDestructive={true}
                details={
                    deleteModal.sessionObj ? [
                        { label: 'نام رشته', value: trends.find(t => t.id === deleteModal.sessionObj!.trendId)?.title || '' },
                        { label: 'روز', value: WEEK_DAYS.find(d => d.id === deleteModal.sessionObj!.dayOfWeek)?.name || '' },
                        { label: 'ساعت شروع', value: deleteModal.sessionObj.fromTime ? toPersianDigits(deleteModal.sessionObj.fromTime) : '-' },
                        { label: 'ساعت پایان', value: deleteModal.sessionObj.toTime ? toPersianDigits(deleteModal.sessionObj.toTime) : '-' }
                    ] : []
                }
            />
        </div>
    );
}
