import { type ElementType } from 'react';

export interface StepItem {
    id: number;
    label: string;
    icon: ElementType;
}

export interface RegisterStepperProps {
    steps: StepItem[];
    currentStep: number;
}

export default function RegisterStepper({ steps, currentStep }: RegisterStepperProps) {
    return (
        <div className="flex items-center justify-center mb-10">
            {steps.map((stepItem, index) => (
                <div key={stepItem.id} className="flex items-center">
                    <div className="flex flex-col items-center gap-2.5 min-w-[100px] max-sm:min-w-[70px] z-[1]">
                        <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all duration-250 border-2
                                ${currentStep === index
                                    ? 'border-primary-500 bg-primary-500 text-white shadow-[0_4px_12px_rgba(124,77,255,0.3)]'
                                    : currentStep > index
                                        ? 'border-primary-300 bg-primary-50 text-primary-500'
                                        : 'border-gray-200 bg-white text-gray-400'
                                }`}
                        >
                            <stepItem.icon />
                        </div>
                        <span
                            className={`text-xs font-medium whitespace-nowrap max-sm:text-[10px]
                                ${currentStep === index
                                    ? 'text-primary-600 font-semibold'
                                    : currentStep > index
                                        ? 'text-primary-400'
                                        : 'text-gray-400'
                                }`}
                        >
                            {stepItem.label}
                        </span>
                    </div>
                    {index < steps.length - 1 && (
                        <div
                            className={`w-[60px] max-sm:w-[30px] h-0.5 mb-7 border-t-2 border-dashed
                                ${currentStep > index ? 'border-primary-300' : 'border-gray-300'}`}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}
