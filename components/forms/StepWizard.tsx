interface StepWizardProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

export function StepWizard({ currentStep, totalSteps, stepTitles }: StepWizardProps) {
  return (
    <div className="w-full flex flex-col items-center gap-2 mb-4 select-none">
      {/* Visual Timeline Row */}
      <div className="relative w-full flex items-center justify-between max-w-sm mx-auto px-4">
        {/* Connection Progress Bar Line behind the circles */}
        <div className="absolute top-1/2 left-4 right-4 h-[2px] bg-slate-100 -translate-y-1/2 z-0" />
        <div 
          className="absolute top-1/2 left-4 h-[2px] bg-[#0f172a] -translate-y-1/2 z-0 transition-all duration-500 ease-out" 
          style={{ width: `calc((100% - 32px) * ${(currentStep - 1) / (totalSteps - 1)})` }}
        />

        {/* Step Nodes */}
        {stepTitles.map((title, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;

          return (
            <div key={title} className="relative z-10 flex flex-col items-center">
              {/* Step Circle */}
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-[#0f172a] border-[#0f172a] text-white' 
                    : isActive 
                      ? 'bg-[#0f172a] border-[#0f172a] text-white shadow-[0_0_0_4px_rgba(15,23,42,0.12)] scale-110' 
                      : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                {isCompleted ? '✓' : stepNum}
              </div>
              {/* Responsive Text Label (Desktop) */}
              <span 
                className={`hidden sm:block text-[10px] uppercase tracking-wider transition-colors duration-300 absolute top-10 font-bold ${
                  isActive 
                    ? 'text-[#0f172a]' 
                    : 'text-slate-400'
                }`}
              >
                {title.split(' ')[0]}
              </span>
            </div>
          );
        })}
      </div>
      {/* Extra spacing to clear absolute text labels on Desktop */}
      <div className="hidden sm:block h-5" />

      {/* Active Step Label for Mobile / Fallback */}
      <p className="text-center text-xs font-bold uppercase tracking-wider text-[#0f172a] sm:hidden mt-2">
        {stepTitles[currentStep - 1]}
      </p>
    </div>
  );
}
