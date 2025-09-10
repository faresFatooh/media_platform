import React from 'react';
import { Step } from '../types';

interface StepIndicatorProps {
  currentStep: Step;
}

const steps: { id: Step; name: string }[] = [
  { id: 'input', name: '1. توفير المحتوى' },
  { id: 'edit', name: '2. مراجعة النص' },
  { id: 'publish', name: '3. إنشاء ونشر' },
];

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center justify-between">
        {steps.map((step, stepIdx) => (
          <li key={step.name} className="relative flex-1">
            {stepIdx < steps.length - 1 ? (
              <div className="absolute inset-0 top-4 right-4 -mr-px mt-0.5 h-0.5 w-full bg-base-300" aria-hidden="true" />
            ) : null}
            <div className="group relative flex items-center justify-start">
                <span className="flex h-9 items-center">
                    <span className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${
                        stepIdx <= currentStepIndex ? 'bg-brand-primary' : 'bg-base-300 group-hover:bg-base-200'
                    }`}>
                        <span className={`${stepIdx <= currentStepIndex ? 'text-white' : 'text-content'}`}>
                          {stepIdx < currentStepIndex ? (
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <span className="text-sm font-medium">{stepIdx + 1}</span>
                          )}
                        </span>
                    </span>
                </span>
                <span className="mr-4 flex min-w-0 flex-col">
                    <span className={`text-sm font-semibold text-right ${stepIdx <= currentStepIndex ? 'text-brand-light' : 'text-gray-400'}`}>
                        {step.name}
                    </span>
                </span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default StepIndicator;