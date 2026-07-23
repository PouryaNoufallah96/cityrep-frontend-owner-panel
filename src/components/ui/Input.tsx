import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    suffix?: ReactNode;
    containerClassName?: string;
    error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
    { label, suffix, id, className = '', containerClassName = '', error, ...props },
    ref,
) {
    return (
        <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
            {label && (
                <label htmlFor={id} className="text-[13px] font-medium text-gray-700 text-right">
                    {label}
                </label>
            )}
            <div className="relative flex items-center">
                <input
                    ref={ref}
                    id={id}
                    className={`h-12 w-full rounded-xl border bg-white px-4 text-right text-[14px] text-gray-800 placeholder:text-gray-400 outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-50 ${
                        error ? 'border-red-400' : 'border-gray-200'
                    } ${suffix ? 'pl-11' : ''} ${className}`}
                    {...props}
                />
                {suffix && <span className="absolute left-3 flex items-center text-gray-400">{suffix}</span>}
            </div>
            {error && <span className="text-[11px] text-red-500 font-medium text-right">{error}</span>}
        </div>
    );
});

export default Input;
