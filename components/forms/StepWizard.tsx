interface StepWizardProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

export function StepWizard({ currentStep, totalSteps, stepTitles }: StepWizardProps) {
  const percent = Math.round((currentStep / totalSteps) * 100);
  const title = stepTitles[currentStep - 1] ?? '';

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-body" aria-current="step">
        Step {currentStep} of {totalSteps}: {title}
      </p>
      <div
        role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-label={`Step ${currentStep} of ${totalSteps}`}
        className="h-2 w-full overflow-hidden rounded-full bg-gray-200"
      >
        <div
          className="h-full bg-brand-peridot transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
