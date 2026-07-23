import TrendIcon from '../../../components/ui/TrendIcon';

interface TrendTabsProps {
    trends: { id: string; title: string; iconUrl?: string; iconKey?: string }[];
    selectedTrend: string;
    setSelectedTrend: (id: string) => void;
}

export default function TrendTabs({ trends, selectedTrend, setSelectedTrend }: TrendTabsProps) {
    return (
        <div className="flex gap-3 overflow-x-auto pb-6 mb-1 custom-scrollbar">
            {trends.map(trend => {
                const isActive = trend.id === selectedTrend;
                return (
                    <button
                        key={trend.id}
                        onClick={() => setSelectedTrend(trend.id)}
                        className={`shrink-0 flex flex-col items-center justify-center gap-2.5 w-[100px] h-[100px] rounded-[14px] border transition-all duration-200
                            ${isActive
                                ? 'border-primary-300 bg-primary-50'
                                : 'border-gray-200 bg-white hover:border-gray-300'}`}
                    >
                        <TrendIcon
                            title={trend.title}
                            iconUrl={trend.iconUrl}
                            iconKey={trend.iconKey}
                            selected={isActive}
                            chip
                            chipClassName={`w-11 h-11 ${isActive ? 'bg-white' : 'bg-primary-50'}`}
                            className={`w-5 h-5 ${isActive ? 'text-primary-500' : 'text-gray-400'}`}
                            imgClassName="w-5 h-5 object-contain"
                        />
                        <span className={`text-[12px] leading-tight text-center px-1.5 ${isActive ? 'font-medium text-gray-800' : 'font-medium text-gray-400'}`}>
                            {trend.title}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
