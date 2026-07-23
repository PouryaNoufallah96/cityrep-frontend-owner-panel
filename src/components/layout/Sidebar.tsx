import { useLocation, useNavigate } from 'react-router-dom';
import { BsGrid, BsPerson, BsCalendar3, BsPeople, BsViewList } from 'react-icons/bs';
import Logo from '../Logo';

const SIDEBAR_ITEMS = [
    { label: 'داشبورد', icon: BsGrid, path: '/dashboard' },
    { label: 'حساب کاربری', icon: BsPerson, path: '/profile' },
    { label: 'مدیریت زمان‌بندی', icon: BsCalendar3, path: '/schedule' },
    { label: 'لیست کلاس‌ها', icon: BsViewList, path: '/classes' },
    { label: 'لیست رزروها', icon: BsPeople, path: '/reservations' },
];

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <aside className="w-[240px] bg-white border-l border-gray-200 py-7 flex flex-col shrink-0 max-lg:hidden min-h-screen sticky top-0">
            <div className="px-6 mb-9 flex justify-center">
                <Logo size={36} textClassName="text-xl font-bold text-primary-700" />
            </div>

            <nav className="flex flex-col gap-1 px-3">
                {SIDEBAR_ITEMS.map((item) => {
                    const isActive =
                        location.pathname.startsWith(item.path) ||
                        (item.path === '/profile' && location.pathname.startsWith('/register'));
                    return (
                        <button
                            key={item.label}
                            onClick={() => navigate(item.path)}
                            className={`relative flex items-center gap-2.5 px-4 py-3 text-sm transition-colors rounded-xl
                ${isActive
                                    ? 'bg-primary-50 text-primary-600 font-semibold'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            {isActive && (
                                <span className="absolute right-0 top-2 bottom-2 w-[3px] rounded-full bg-primary-500" />
                            )}
                            <item.icon className="text-lg" />
                            {item.label}
                        </button>
                    );
                })}
            </nav>
        </aside>
    );
}
