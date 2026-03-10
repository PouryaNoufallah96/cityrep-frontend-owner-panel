import { useState, useRef, useEffect } from 'react';
import { BsPerson } from 'react-icons/bs';
import { LuLogOut } from 'react-icons/lu';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        setIsMenuOpen(false);
        logout();
        navigate('/login');
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary-500" />
                <h1 className="text-base font-bold text-gray-800">{title}</h1>
            </div>
            <div className="flex items-center gap-3">
                {subtitle && (
                    <span className="text-sm text-gray-600 font-medium">
                        {subtitle}
                    </span>
                )}
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-primary-300 hover:text-primary-500 transition-colors cursor-pointer"
                        id="header-profile-btn"
                    >
                        <BsPerson size={24} />
                    </button>

                    {isMenuOpen && (
                        <div className="absolute left-0 top-[calc(100%+8px)] bg-white border border-gray-100 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] py-2 z-50 min-w-[180px] animate-[fadeIn_0.15s_ease-out]">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-5 py-3 text-[13px] font-medium text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                                id="header-logout-btn"
                            >
                                <LuLogOut size={18} />
                                خروج از حساب
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
