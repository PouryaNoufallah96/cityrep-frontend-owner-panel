import { createElement } from 'react';
import { resolveTrendIcon } from '../../utils/trendIcons';

interface TrendIconProps {
    title: string;
    iconUrl?: string;
    iconKey?: string;
    className?: string;
    imgClassName?: string;
    selected?: boolean;
    chip?: boolean;
    chipClassName?: string;
}

export default function TrendIcon({
    title,
    iconUrl,
    iconKey,
    className = 'w-5 h-5 shrink-0 text-primary-500',
    imgClassName = 'w-5 h-5 object-contain shrink-0',
    selected = false,
    chip = false,
    chipClassName = 'w-10 h-10 bg-primary-50',
}: TrendIconProps) {
    const icon = iconUrl?.includes('File/DownloadFile') ? (
        <img
            src={iconUrl}
            alt=""
            className={`${imgClassName}${selected ? '' : ' opacity-80'}`}
        />
    ) : (
        createElement(resolveTrendIcon(title, iconKey), { className })
    );

    if (!chip) return icon;

    return (
        <span className={`inline-flex items-center justify-center rounded-full shrink-0 ${chipClassName}`}>
            {icon}
        </span>
    );
}
