import { useEffect, useState } from 'react';
import { LuZap } from 'react-icons/lu';

interface TrendIconProps {
    title?: string;
    iconUrl?: string;
    className?: string;
    imgClassName?: string;
    selected?: boolean;
    chip?: boolean;
    chipClassName?: string;
}

export default function TrendIcon({
    iconUrl,
    className = 'w-5 h-5 shrink-0 text-primary-500',
    imgClassName = 'w-5 h-5 object-contain shrink-0',
    selected = false,
    chip = false,
    chipClassName = 'w-10 h-10 bg-primary-50',
}: TrendIconProps) {
    const [imageFailed, setImageFailed] = useState(false);

    useEffect(() => {
        setImageFailed(false);
    }, [iconUrl]);

    const src = iconUrl
        ? iconUrl.includes('File/DownloadFile')
            ? iconUrl
            : `${import.meta.env.VITE_BASE_API}/File/DownloadFile/${iconUrl}`
        : undefined;

    const icon = src && !imageFailed ? (
        <img
            src={src}
            alt=""
            className={`${imgClassName}${selected ? '' : ' opacity-80'}`}
            onError={() => setImageFailed(true)}
        />
    ) : (
        <LuZap className={className} />
    );

    if (!chip) return icon;

    return (
        <span className={`inline-flex items-center justify-center rounded-full shrink-0 ${chipClassName}`}>
            {icon}
        </span>
    );
}
