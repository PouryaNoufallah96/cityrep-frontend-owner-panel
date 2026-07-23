import TrendIcon from '../../../components/ui/TrendIcon';
import type { StepProps } from '../types';

interface TrendItem {
    gymTrendId: string;
    title: string;
    iconUrl?: string;
    iconKey?: string;
}

interface SportTrendsStepProps extends StepProps {
    toggleTrend: (id: string) => void;
    trends: TrendItem[];
}

export default function SportTrendsStep({ formData, toggleTrend, trends }: SportTrendsStepProps) {
    return (
        <div className="bg-[#F9F9F9] rounded-2xl p-5 animate-[fadeIn_0.3s_ease-out]">
            <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
                {trends.map((trend) => {
                    const selected = formData.selectedTrends.includes(trend.gymTrendId);
                    return (
                        <button
                            key={trend.gymTrendId}
                            type="button"
                            onClick={() => toggleTrend(trend.gymTrendId)}
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-[12px] cursor-pointer transition-colors
                                ${selected
                                    ? 'bg-[#EEECFB] border border-[#C0B6F2]'
                                    : 'bg-white border border-[#E8E8E8] hover:border-gray-300'
                                }`}
                        >
                            <TrendIcon
                                title={trend.title}
                                iconUrl={trend.iconUrl}
                                iconKey={trend.iconKey}
                                selected={selected}
                                className={`w-5 h-5 shrink-0 ${selected ? 'text-primary-500' : 'text-primary-400'}`}
                            />
                            <span className={`flex-1 text-right text-[13px] font-medium truncate ${selected ? 'text-primary-500' : 'text-gray-800'}`}>
                                {trend.title}
                            </span>
                            <div
                                className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center transition-colors shrink-0
                                    ${selected
                                        ? 'border-primary-500 bg-primary-500'
                                        : 'border-[#C8C8C8] bg-white'
                                    }`}
                            >
                                {selected && (
                                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
