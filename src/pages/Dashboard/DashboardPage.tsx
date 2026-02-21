import { useAuth } from '../../context/AuthContext';
import { BsPerson } from 'react-icons/bs';
import Sidebar from '../../components/layout/Sidebar';

export default function DashboardPage() {
    const { gymOwner } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 flex" dir="rtl">
            {/* Sidebar */}
            <Sidebar />

            {/* Main */}
            <div className="flex-1 flex flex-col">
                <header className="flex items-center justify-end px-8 py-4 bg-white border-b border-gray-200 gap-3">
                    <span className="text-sm text-gray-600">
                        {gymOwner?.fullName}
                    </span>
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                        <BsPerson size={18} />
                    </div>
                </header>

                <main className="flex-1 p-10 max-sm:p-5">
                    <h1 className="text-xl font-bold text-gray-900 mb-6">داشبورد</h1>
                    <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
                        {[
                            { title: 'وضعیت حساب', value: gymOwner?.status === 'Active' ? 'فعال' : 'در انتظار تایید', color: 'primary' },
                            { title: 'شماره تماس', value: gymOwner?.phoneNumber || '—', color: 'primary' },
                            { title: 'آخرین ورود', value: gymOwner?.loginDates?.[0] ? new Date(gymOwner.loginDates[0]).toLocaleDateString('fa-IR') : '—', color: 'primary' },
                        ].map((card) => (
                            <div key={card.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                <p className="text-[13px] text-gray-500 mb-2">{card.title}</p>
                                <p className="text-lg font-semibold text-gray-900" dir="ltr" style={{ textAlign: 'right' }}>
                                    {card.value}
                                </p>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}
