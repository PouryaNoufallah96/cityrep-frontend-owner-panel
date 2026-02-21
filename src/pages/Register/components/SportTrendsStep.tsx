import type { StepProps } from '../types';

interface SportTrendsStepProps extends StepProps {
    toggleTrend: (id: string) => void;
    trends: any[];
}

export default function SportTrendsStep({ formData, toggleTrend, trends }: SportTrendsStepProps) {
    return (
        <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1 animate-[fadeIn_0.3s_ease-out]">
            {trends.map((trend: any) => {
                const selected = formData.selectedTrends.includes(trend.gymTrendId);
                return (
                    <button
                        key={trend.gymTrendId}
                        type="button"
                        onClick={() => toggleTrend(trend.gymTrendId)}
                        className={`flex items-center gap-2.5 px-4 py-3.5 border-[1.5px] rounded-[10px] cursor-pointer transition-all duration-200 flex-row-reverse justify-between
                            ${selected
                                ? 'border-primary-400 bg-primary-50'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-base">{trend.iconUrl || '🏋️'}</span>
                            <span className="text-[13px] font-medium text-gray-900">{trend.title}</span>
                        </div>
                        <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0
                                ${selected
                                    ? 'border-primary-500 bg-primary-500'
                                    : 'border-gray-300'
                                }`}
                        >
                            {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
