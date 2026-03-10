import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

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
import { useGymTrends } from '../../hooks/useGym';

export default function SchedulePage() {
    const { gymOwner } = useAuth();

    const { data: apiResponse } = useGymTrends();
    const apiTrends = Array.isArray(apiResponse) ? apiResponse : (apiResponse?.data || []);
    const trends = apiTrends.map((t: any) => ({
        id: t.gymTrendId,
        title: t.title,
        iconUrl: t.iconUrl ? `${import.meta.env.VITE_BASE_API}/File/DownloadFile/${t.iconUrl}` : '🏋️'
    })) || [];

    const [selectedTrend, setSelectedTrend] = useState('');
    const [localSessions, setLocalSessions] = useState<LocalSession[]>([]);
    const [loadedTrends, setLoadedTrends] = useState<Set<string>>(new Set());

    const [activePicker, setActivePicker] = useState<string | null>(null);
    const pickerRef = useRef<HTMLDivElement>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; sessionObj: LocalSession | null }>({
        isOpen: false,
        sessionObj: null
    });
    const [saveModalOpen, setSaveModalOpen] = useState(false);

    useEffect(() => {
        if (trends.length > 0 && !selectedTrend) {
            setSelectedTrend(trends[0].id);
        }
    }, [trends, selectedTrend]);

    useEffect(() => {
        if (selectedTrend && !loadedTrends.has(selectedTrend)) {
            loadSessions(selectedTrend);
        }
    }, [selectedTrend, loadedTrends]);

    const loadSessions = async (trendToLoad: string) => {
        setLoadedTrends(prev => new Set(prev).add(trendToLoad));
        try {
            const data = await scheduleService.getSessions(trendToLoad);
            const local = data.map(s => ({
                _clientId: Math.random().toString(36).substring(7),
                id: s.id,
                dayOfWeek: s.dayOfWeek,
                trendId: s.trendId,
                fromTime: s.fromTime,
                toTime: s.toTime,
                capacity: String(s.capacity),
                price: String(s.price),
                applyAllDays: false
            }));
            setLocalSessions(prev => [...prev.filter(s => s.trendId !== trendToLoad), ...local]);
        } catch (e) {
            setLoadedTrends(prev => {
                const next = new Set(prev);
                next.delete(trendToLoad);
                return next;
            });
            toast.error('خطا در بارگزاری سانس‌ها');
        }
    };

    const handleAddSession = (dayId: number) => {
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
                applyAllDays: false
            }
        ]);
    };

    const updateSession = (clientId: string, updates: Partial<LocalSession>) => {
        setLocalSessions(prev => {
            let next = prev.map(s => s._clientId === clientId ? { ...s, ...updates } : s);
            const source = next.find(s => s._clientId === clientId);
            if (source && source.applyAllDays) {
                // Keep connected clones implicitly synchronized with the visual edit commands
                next = next.map(s => {
                    if (s._clonedFrom === clientId) {
                        return {
                            ...s,
                            ...(updates.fromTime !== undefined && { fromTime: updates.fromTime }),
                            ...(updates.toTime !== undefined && { toTime: updates.toTime }),
                            ...(updates.capacity !== undefined && { capacity: updates.capacity }),
                            ...(updates.price !== undefined && { price: updates.price })
                        };
                    }
                    return s;
                });
            }
            return next;
        });
    };

    const handleToggleAllDays = (clientId: string, checked: boolean) => {
        setLocalSessions(prev => {
            const source = prev.find(s => s._clientId === clientId);
            if (!source) return prev;

            let updated = [...prev];
            const sourceIdx = updated.findIndex(s => s._clientId === clientId);
            updated[sourceIdx] = { ...updated[sourceIdx], applyAllDays: checked };

            if (checked) {
                // Map the clone visually into the other 6 column days explicitly
                WEEK_DAYS.forEach(day => {
                    if (day.id !== source.dayOfWeek) {
                        updated.push({
                            _clientId: Math.random().toString(36).substring(7),
                            dayOfWeek: day.id,
                            trendId: source.trendId,
                            fromTime: source.fromTime,
                            toTime: source.toTime,
                            capacity: source.capacity,
                            price: source.price,
                            applyAllDays: false,
                            _clonedFrom: clientId
                        });
                    }
                });
            } else {
                // Remove unsaved clones if untoggled before making POST hooks
                updated = updated.filter(s => !(s._clonedFrom === clientId && !s.id));
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

        if (session?.id) {
            // Delete from DB immediately
            await scheduleService.deleteSession(session.id);
        }
        setLocalSessions(prev => prev.filter(s => s._clientId !== clientId));
        toast.success('حذف سانس با موفقیت انجام شد.');
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
            handlePerformSave(true); // Save current because it's the only one
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

            for (const s of changesToSave) {
                if (!s.fromTime || !s.toTime || !s.capacity || !s.price) continue;
                await scheduleService.addSession({
                    dayOfWeek: s.dayOfWeek,
                    trendId: s.trendId,
                    fromTime: s.fromTime,
                    toTime: s.toTime,
                    capacity: Number(s.capacity),
                    price: Number(s.price)
                }, false);
            }

            toast.success(onlyCurrent ? 'تغییرات رشته فعلی با موفقیت ثبت شد.' : 'تغییرات تمامی رشته‌ها ثبت شد.');

            // Clear cache to trigger re-fetch dynamically
            setLoadedTrends(prev => {
                const next = new Set(prev);
                if (onlyCurrent) {
                    next.delete(selectedTrend);
                } else {
                    next.clear();
                    setLocalSessions([]); // Complete wipe triggers fetch for selection
                }
                return next;
            });
        } catch (e) {
            toast.error('خطا در ثبت تغییرات');
        } finally {
            setIsSaving(false);
        }
    };

    // Auto-close open picker when clicking outside
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


                {/* Main Content scrollable */}
                <main className="flex-1 overflow-y-auto p-8 max-sm:p-4 bg-gray-50 relative z-10">
                    <div className="max-w-[1200px] mx-auto flex flex-col gap-6">

                        {/* Top Header Card */}
                        <PageHeader title="مدیریت زمان‌بندی" subtitle={gymOwner?.fullName} />

                        {/* Content Card */}
                        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 p-8 min-h-[calc(100vh-220px)] flex flex-col">

                            {/* Trends Tab */}
                            <TrendTabs
                                trends={trends}
                                selectedTrend={selectedTrend}
                                setSelectedTrend={setSelectedTrend}
                            />

                            {/* Calendar Board */}
                            <div className="flex-1 overflow-auto pb-6 border-b border-gray-100 custom-scrollbar relative flex min-h-[644px]">
                                <div className="flex min-w-[max-content] flex-1 pb-24">
                                    {WEEK_DAYS.map((day, index) => {
                                        const daySessions = localSessions.filter(s => s.dayOfWeek === day.id && s.trendId === selectedTrend);

                                        return (
                                            <div key={day.id} className={`w-[270px] shrink-0 flex flex-col px-3 bg-[#e8e8e840] ${index > 0 ? 'border-r border-[#e8e8e8]' : ''}`}>
                                                <h3 className="text-[13px] font-bold text-gray-700 text-center mb-5 pt-5">
                                                    {day.name}
                                                </h3>

                                                <div className="flex flex-col gap-4">
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
                                                        />
                                                    ))}

                                                    {/* Add Session Button */}
                                                    <button
                                                        onClick={() => handleAddSession(day.id)}
                                                        className="w-full py-[14px] border-[1.5px] border-dashed border-primary-200 rounded-[12px] text-primary-500 text-[12.5px] font-bold flex items-center justify-center gap-1.5 hover:bg-primary-50 transition-all duration-200 bg-white"
                                                    >
                                                        <HiOutlinePlus size={16} className="text-primary-400" />
                                                        افزودن سانس
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Submit DB Changes */}
                            <div className="pt-6 mt-6 flex items-center justify-start shrink-0">
                                <button
                                    onClick={handlePreSave}
                                    disabled={isSaving}
                                    className="px-10 py-3.5 bg-primary-600 text-white rounded-[12px] text-[13px] font-bold shadow-[0_4px_20px_rgba(124,77,255,0.25)] hover:bg-primary-700 hover:shadow-[0_4px_25px_rgba(124,77,255,0.35)] hover:-translate-y-0.5 transition-all outline-none disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-wait"
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
                        { label: 'نام رشته', value: trends.find((t: any) => t.id === deleteModal.sessionObj!.trendId)?.title || '' },
                        { label: 'روز', value: WEEK_DAYS.find((d: any) => d.id === deleteModal.sessionObj!.dayOfWeek)?.name || '' },
                        { label: 'ساعت شروع', value: deleteModal.sessionObj.fromTime || '-' },
                        { label: 'ساعت پایان', value: deleteModal.sessionObj.toTime || '-' }
                    ] : []
                }
            />
        </div>
    );
}
