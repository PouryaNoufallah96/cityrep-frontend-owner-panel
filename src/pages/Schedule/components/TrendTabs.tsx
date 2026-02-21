interface TrendTabsProps {
    trends: { id: string; title: string; iconUrl: string }[];
    selectedTrend: string;
    setSelectedTrend: (id: string) => void;
}

export default function TrendTabs({ trends, selectedTrend, setSelectedTrend }: TrendTabsProps) {
    return (
        <div className="flex gap-4 overflow-x-auto pb-6 mb-2 custom-scrollbar">
            {trends.map(trend => {
                const isActive = trend.id === selectedTrend;
                return (
                    <button
                        key={trend.id}
                        onClick={() => setSelectedTrend(trend.id)}
                        className={`shrink-0 flex flex-col items-center justify-center w-[100px] h-[100px] rounded-[16px] border-[1.5px] transition-all duration-200
                            ${isActive
                                ? 'border-primary-200 bg-primary-50 text-primary-700'
                                : 'border-gray-100/80 bg-white text-gray-500 hover:border-gray-200 hover:bg-gray-50'}`}
                    >
                        <span className="text-3xl mb-2">{trend.iconUrl}</span>
                        <span className={`text-[13px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                            {trend.title}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
