import React, { useState, useRef } from 'react';

type Mode = 'hours' | 'minutes';

interface RadialTimePickerProps {
    value?: string; // e.g. "09:45"
    onChange?: (val: string) => void;
}

export default function RadialTimePicker({ value, onChange }: RadialTimePickerProps) {
    const [mode, setMode] = useState<Mode>('hours');

    const [h, m] = value ? value.split(':').map(Number) : [12, 0];
    const hour = isNaN(h) ? 12 : h;
    const minute = isNaN(m) ? 0 : m;

    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const updateTime = (h: number, m: number) => {
        const hh = String(h).padStart(2, '0');
        const mm = String(m).padStart(2, '0');
        onChange?.(`${hh}:${mm}`);
    };

    const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging) return;
        calculateValueFromEvent(e);
    };

    const calculateValueFromEvent = (e: React.MouseEvent | React.TouchEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();

        let clientX = 0;
        let clientY = 0;

        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        const x = clientX - rect.left - rect.width / 2;
        const y = clientY - rect.top - rect.height / 2;

        let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
        if (angle < 0) angle += 360;

        const distance = Math.sqrt(x * x + y * y);

        if (mode === 'hours') {
            let h = Math.round(angle / 30);
            if (h === 0) h = 12;

            const isInner = distance < rect.width * 0.35;
            if (isInner) {
                h = h === 12 ? 0 : h + 12;
            } else {
                h = h === 12 ? 12 : h;
            }
            // Normalize to 0-23
            if (h === 24) h = 0;
            updateTime(h, minute);
        } else {
            let m = Math.round((angle % 360) / 6);
            if (m === 60) m = 0;
            updateTime(hour, m);
        }
    };

    const getHandStyles = () => {
        let angle = 0;
        let length = '40%';
        if (mode === 'hours') {
            angle = (hour % 12) * 30;
            if (hour === 0 || hour > 12) {
                length = '24%';
            } else {
                length = '40%';
            }
        } else {
            angle = minute * 6;
            length = '40%';
        }
        return {
            transform: `rotate(${angle}deg)`,
            height: length
        };
    };

    const renderNumbers = () => {
        if (mode === 'hours') {
            const outerNumbers = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
            const innerNumbers = [0, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

            return (
                <>
                    {outerNumbers.map((num, i) => {
                        const theta = (i * 30 - 90) * (Math.PI / 180);
                        const radius = 40;
                        const x = 50 + radius * Math.cos(theta);
                        const y = 50 + radius * Math.sin(theta);
                        const active = hour === num || (hour === 0 && num === 0);

                        return (
                            <div key={`outer-${num}`}
                                className={`absolute w-8 h-8 -ml-4 -mt-4 flex items-center justify-center rounded-full text-[13px] font-medium select-none transition-colors 
                                   ${active ? 'bg-primary-500 text-white z-10' : 'text-gray-700 hover:bg-gray-200'}`}
                                style={{ left: `${x}%`, top: `${y}%` }}>
                                {String(num).padStart(2, '0')}
                            </div>
                        )
                    })}
                    {innerNumbers.map((num, i) => {
                        const theta = (i * 30 - 90) * (Math.PI / 180);
                        const radius = 24;
                        const x = 50 + radius * Math.cos(theta);
                        const y = 50 + radius * Math.sin(theta);
                        const active = hour === num || (hour === 24 && num === 0);

                        return (
                            <div key={`inner-${num}`}
                                className={`absolute w-7 h-7 -ml-3.5 -mt-3.5 flex items-center justify-center rounded-full text-xs font-medium select-none transition-colors
                                   ${active ? 'bg-primary-500 text-white z-10' : 'text-gray-500 hover:bg-gray-200'}`}
                                style={{ left: `${x}%`, top: `${y}%` }}>
                                {String(num).padStart(2, '0')}
                            </div>
                        )
                    })}
                </>
            );
        } else {
            const minuteNumbers = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
            return minuteNumbers.map((num, i) => {
                const theta = (i * 30 - 90) * (Math.PI / 180);
                const radius = 40;
                const x = 50 + radius * Math.cos(theta);
                const y = 50 + radius * Math.sin(theta);

                const active = minute === num;
                const near = !active && num === (Math.round(minute / 5) * 5) % 60;

                return (
                    <div key={`min-${num}`}
                        className={`absolute w-8 h-8 -ml-4 -mt-4 flex items-center justify-center rounded-full text-[13px] font-medium select-none transition-colors
                           ${active ? 'bg-primary-500 text-white z-10' : (near ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-200')}`}
                        style={{ left: `${x}%`, top: `${y}%` }}>
                        {String(num).padStart(2, '0')}
                    </div>
                )
            });
        }
    };

    return (
        <div className="w-[280px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 p-5 select-none" dir="ltr">
            {/* Header / Display */}
            <div className="flex justify-center items-baseline gap-2 mb-6">
                <button
                    onClick={() => setMode('hours')}
                    className={`text-4xl font-bold transition-colors outline-none cursor-pointer ${mode === 'hours' ? 'text-primary-600' : 'text-gray-300 hover:text-gray-400'}`}>
                    {String(hour).padStart(2, '0')}
                </button>
                <span className="text-3xl font-bold text-gray-300 pb-1">:</span>
                <button
                    onClick={() => setMode('minutes')}
                    className={`text-4xl font-bold transition-colors outline-none cursor-pointer ${mode === 'minutes' ? 'text-primary-600' : 'text-gray-300 hover:text-gray-400'}`}>
                    {String(minute).padStart(2, '0')}
                </button>
            </div>

            {/* Dial Container */}
            <div
                ref={containerRef}
                className="relative w-full aspect-square rounded-full bg-gray-50 touch-none cursor-pointer"
                onMouseDown={(e) => { setIsDragging(true); calculateValueFromEvent(e); }}
                onMouseMove={handlePointerMove}
                onMouseUp={() => { setIsDragging(false); if (mode === 'hours') setMode('minutes'); }}
                onMouseLeave={() => setIsDragging(false)}
                onTouchStart={(e) => { setIsDragging(true); calculateValueFromEvent(e); }}
                onTouchMove={handlePointerMove}
                onTouchEnd={() => { setIsDragging(false); if (mode === 'hours') setMode('minutes'); }}
            >
                {/* Center Dot */}
                <div className="absolute left-1/2 top-1/2 w-2 h-2 -ml-1 -mt-1 rounded-full bg-primary-500 z-20" />

                {/* Hand Line */}
                <div
                    className="absolute left-1/2 bottom-1/2 w-0.5 -ml-[1px] bg-primary-500 origin-bottom pointer-events-none transition-all duration-200 z-0"
                    style={getHandStyles()}
                >
                    {/* Select indicator */}
                    <div className="absolute -top-[15px] -left-[15px] w-[30px] h-[30px] rounded-full bg-primary-500" />
                </div>

                {/* Numbers */}
                {renderNumbers()}
            </div>
        </div>
    );
}
