import { useLocation, useNavigate } from 'react-router-dom';
import { BsGrid, BsPerson, BsCalendar3, BsPeople } from 'react-icons/bs';
import Logo from '../Logo';
import { useAuth } from '../../context/AuthContext';

const SIDEBAR_ITEMS = [
    { label: 'داشبورد', icon: BsGrid, path: '/dashboard' },
    { label: 'حساب کاربری', icon: BsPerson, path: '/register' },
    { label: 'مدیریت زمان‌بندی', icon: BsCalendar3, path: '/schedule' },
    { label: 'لیست رزروها', icon: BsPeople, path: '/reservations' },
];

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    return (
        <aside className="w-[240px] bg-white border-l border-gray-200 py-7 flex flex-col shrink-0 max-lg:hidden min-h-screen sticky top-0">
            <div className="px-6 mb-9">
                <Logo size={36} textClassName="text-xl font-bold text-primary-700" />
            </div>

            <nav className="flex flex-col gap-1">
                {SIDEBAR_ITEMS.map((item) => {
                    const isActive = location.pathname.startsWith(item.path);
                    return (
                        <button
                            key={item.label}
                            onClick={() => navigate(item.path)}
                            className={`flex items-center gap-2.5 px-6 py-3 text-sm transition-colors relative
                ${isActive
                                    ? 'bg-primary-50 text-primary-600 font-semibold before:absolute before:right-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-primary-500 before:rounded-l-md'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <item.icon className="text-lg" />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            <div className="mt-auto px-6">
                <button
                    onClick={logout}
                    className="w-full py-2.5 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                    خروج
                </button>
            </div>
        </aside>
    );
}
