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
      <p className="text-sm font-medium text-slate-500" aria-current="step">
        Step <span className="text-[#6aa337] font-bold">{currentStep}</span> of {totalSteps}: <span className="text-slate-800 font-semibold">{title}</span>
      </p>
      <div
        role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-label={`Step ${currentStep} of ${totalSteps}`}
        className="h-2 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200/20"
      >
        <div
          className="h-full bg-[#6aa337] transition-all duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
