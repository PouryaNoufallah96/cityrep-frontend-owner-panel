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
        <div className="flex w-full max-w-[520px] mx-auto mb-8 px-1">
            {steps.map((stepItem, index) => {
                const isCompleted = currentStep > index;
                const isActive = currentStep === index;
                const lineBeforeDone = currentStep >= index;
                const lineAfterDone = currentStep > index;

                return (
                    <div key={stepItem.id} className="flex-1 flex flex-col items-center min-w-0">
                        <div className="flex items-center w-full">
                            {index === 0 ? (
                                <div className="flex-1" />
                            ) : (
                                <div
                                    className={`flex-1 h-0 border-t border-dashed
                                        ${lineBeforeDone ? 'border-primary-300' : 'border-gray-300'}`}
                                />
                            )}

                            <div
                                className={`w-11 h-11 rounded-full flex items-center justify-center text-[20px] transition-colors border-[1.5px] shrink-0 z-[1]
                                    ${isCompleted
                                        ? 'border-primary-500 bg-primary-500 text-white'
                                        : isActive
                                            ? 'border-primary-500 bg-primary-50 text-primary-500'
                                            : 'border-gray-200 bg-gray-50 text-gray-400'
                                    }`}
                            >
                                <stepItem.icon />
                            </div>

                            {index === steps.length - 1 ? (
                                <div className="flex-1" />
                            ) : (
                                <div
                                    className={`flex-1 h-0 border-t border-dashed
                                        ${lineAfterDone ? 'border-primary-300' : 'border-gray-300'}`}
                                />
                            )}
                        </div>

                        <span
                            className={`text-[11px] font-medium whitespace-nowrap mt-2 max-sm:text-[10px]
                                ${isActive || isCompleted
                                    ? 'text-primary-500'
                                    : 'text-gray-400'
                                }`}
                        >
                            {stepItem.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
