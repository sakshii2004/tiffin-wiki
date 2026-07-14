'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, useFieldArray, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AddListingClientSchema, type AddListingClientInput } from '@/lib/validations';
import { cn } from '@/lib/cn';
import { FIELD_BASE } from '@/components/ui/styles';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { TagInput } from '@/components/forms/TagInput';
import { ImageUploader } from '@/components/forms/ImageUploader';
import { StepWizard } from '@/components/forms/StepWizard';
import { Store, MapPin, Phone, IndianRupee, UtensilsCrossed, ChevronDown, ChevronUp, X } from 'lucide-react';

// The form carries the honeypot field in addition to the validated client schema.
// The Zod resolver validates ONLY AddListingClientSchema (honeypot excluded), so
// browser autofill of the hidden trap can never block a real user's submission.
type FormValues = AddListingClientInput & { honeypot: string };

type Step = 1 | 2 | 3;

const CITIES = [
  { label: 'Mumbai', value: 'mumbai' },
  { label: 'Delhi', value: 'delhi' },
  { label: 'Bengaluru', value: 'bengaluru' },
  { label: 'Hyderabad', value: 'hyderabad' },
  { label: 'Ahmedabad', value: 'ahmedabad' },
  { label: 'Chennai', value: 'chennai' },
  { label: 'Kolkata', value: 'kolkata' },
  { label: 'Pune', value: 'pune' },
  { label: 'Jaipur', value: 'jaipur' },
  { label: 'Surat', value: 'surat' },
  { label: 'Lucknow', value: 'lucknow' },
  { label: 'Kanpur', value: 'kanpur' },
  { label: 'Nagpur', value: 'nagpur' },
  { label: 'Indore', value: 'indore' },
  { label: 'Thane', value: 'thane' },
  { label: 'Bhopal', value: 'bhopal' },
  { label: 'Visakhapatnam', value: 'visakhapatnam' },
  { label: 'Pimpri-Chinchwad', value: 'pimpri-chinchwad' },
  { label: 'Patna', value: 'patna' },
  { label: 'Vadodara', value: 'vadodara' },
  { label: 'Ghaziabad', value: 'ghaziabad' },
  { label: 'Ludhiana', value: 'ludhiana' },
  { label: 'Agra', value: 'agra' },
  { label: 'Nashik', value: 'nashik' },
  { label: 'Faridabad', value: 'faridabad' },
  { label: 'Meerut', value: 'meerut' },
  { label: 'Rajkot', value: 'rajkot' },
  { label: 'Kalyan-Dombivli', value: 'kalyan-dombivli' },
  { label: 'Vasai-Virar', value: 'vasai-virar' },
  { label: 'Varanasi', value: 'varanasi' },
  { label: 'Srinagar', value: 'srinagar' },
  { label: 'Aurangabad', value: 'aurangabad' },
  { label: 'Dhanbad', value: 'dhanbad' },
  { label: 'Amritsar', value: 'amritsar' },
  { label: 'Navi Mumbai', value: 'navi-mumbai' },
  { label: 'Allahabad', value: 'allahabad' },
  { label: 'Ranchi', value: 'ranchi' },
  { label: 'Howrah', value: 'howrah' },
  { label: 'Coimbatore', value: 'coimbatore' },
  { label: 'Jabalpur', value: 'jabalpur' },
  { label: 'Gwalior', value: 'gwalior' },
  { label: 'Vijayawada', value: 'vijayawada' },
  { label: 'Jodhpur', value: 'jodhpur' },
  { label: 'Madurai', value: 'madurai' },
  { label: 'Raipur', value: 'raipur' },
  { label: 'Kota', value: 'kota' },
  { label: 'Guwahati', value: 'guwahati' },
  { label: 'Chandigarh', value: 'chandigarh' },
  { label: 'Solapur', value: 'solapur' },
  { label: 'Hubli-Dharwad', value: 'hubli-dharwad' },
  { label: 'Bareilly', value: 'bareilly' },
  { label: 'Moradabad', value: 'moradabad' },
  { label: 'Mysore', value: 'mysore' },
  { label: 'Gurgaon', value: 'gurgaon' },
  { label: 'Aligarh', value: 'aligarh' },
  { label: 'Jalandhar', value: 'jalandhar' },
  { label: 'Tiruchirappalli', value: 'tiruchirappalli' },
  { label: 'Bhubaneswar', value: 'bhubaneswar' },
  { label: 'Salem', value: 'salem' },
  { label: 'Mira-Bhayandar', value: 'mira-bhayandar' },
  { label: 'Warangal', value: 'warangal' },
  { label: 'Guntur', value: 'guntur' },
  { label: 'Bhiwandi', value: 'bhiwandi' },
  { label: 'Saharanpur', value: 'saharanpur' },
  { label: 'Gorakhpur', value: 'gorakhpur' },
  { label: 'Bikaner', value: 'bikaner' },
  { label: 'Amravati', value: 'amravati' },
  { label: 'Noida', value: 'noida' },
  { label: 'Jamshedpur', value: 'jamshedpur' },
  { label: 'Bhilai', value: 'bhilai' },
  { label: 'Cuttack', value: 'cuttack' },
  { label: 'Firozabad', value: 'firozabad' },
  { label: 'Kochi', value: 'kochi' },
  { label: 'Nellore', value: 'nellore' },
  { label: 'Bhavnagar', value: 'bhavnagar' },
  { label: 'Dehradun', value: 'dehradun' },
  { label: 'Durgapur', value: 'durgapur' },
  { label: 'Asansol', value: 'asansol' },
  { label: 'Rourkela', value: 'rourkela' },
  { label: 'Nanded', value: 'nanded' },
  { label: 'Kolhapur', value: 'kolhapur' },
  { label: 'Ajmer', value: 'ajmer' },
  { label: 'Akola', value: 'akola' },
  { label: 'Gulbarga', value: 'gulbarga' },
  { label: 'Jamnagar', value: 'jamnagar' },
  { label: 'Ujjain', value: 'ujjain' },
  { label: 'Loni', value: 'loni' },
  { label: 'Jhansi', value: 'jhansi' },
  { label: 'Pondicherry', value: 'pondicherry' },
  { label: 'Jammu', value: 'jammu' },
  { label: 'Belgaum', value: 'belgaum' },
  { label: 'Mangalore', value: 'mangalore' },
  { label: 'Tirunelveli', value: 'tirunelveli' },
  { label: 'Malegaon', value: 'malegaon' },
  { label: 'Gaya', value: 'gaya' },
  { label: 'Udaipur', value: 'udaipur' },
  { label: 'Kakinada', value: 'kakinada' },
  { label: 'Davanagere', value: 'davanagere' },
  { label: 'Kozhikode', value: 'kozhikode' },
  { label: 'Shimla', value: 'shimla' },
  { label: 'Panaji', value: 'panaji' },
  { label: 'Gangtok', value: 'gangtok' },
  { label: 'Shillong', value: 'shillong' },
  { label: 'Imphal', value: 'imphal' },
  { label: 'Aizawl', value: 'aizawl' },
  { label: 'Kohima', value: 'kohima' },
  { label: 'Itanagar', value: 'itanagar' },
  { label: 'Agartala', value: 'agartala' },
  { label: 'Silvassa', value: 'silvassa' },
  { label: 'Daman', value: 'daman' },
  { label: 'Port Blair', value: 'port-blair' },
] as const;

const MEALS = [
  { label: 'Breakfast', value: 'BREAKFAST' },
  { label: 'Lunch', value: 'LUNCH' },
  { label: 'Dinner', value: 'DINNER' },
] as const;

const OPERATIONAL_DAYS = [
  { label: 'Mon', value: 'MON' },
  { label: 'Tue', value: 'TUE' },
  { label: 'Wed', value: 'WED' },
  { label: 'Thu', value: 'THU' },
  { label: 'Fri', value: 'FRI' },
  { label: 'Sat', value: 'SAT' },
  { label: 'Sun', value: 'SUN' },
] as const;

const STEP_TITLES = ['Basic info', 'Service details', 'Delivery & images'];

// Fields validated per step before advancing (honeypot deliberately excluded).
const stepFields: Record<Step, (keyof AddListingClientInput)[]> = {
  1: ['name', 'city', 'area', 'whatsappNumber', 'isVegetarian', 'hasNonVeg'],
  2: [
    'mealsOffered',
    'offerings',
    'spiceLevel',
    'containerType',
    'requiresTiffinWash',
    'operationalDays',
  ],
  3: ['deliveryAreas', 'description', 'submitterNote', 'r2Keys'],
};

const checkboxBase =
  'inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 font-semibold cursor-pointer transition-all active:scale-[0.98] hover:bg-slate-50/50 hover:border-slate-300 has-[:checked]:border-[#6aa337] shadow-[0_1px_2px_rgba(0,0,0,0.02)] select-none';

// Solid peridot fill when checked — used for all toggle-chip groups.
const checkboxClass = `${checkboxBase} has-[:checked]:border-[#6aa337] has-[:checked]:bg-[#6aa337] has-[:checked]:text-white`;

export function AddListingForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [uploadedKeys, setUploadedKeys] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [cityQuery, setCityQuery] = useState('');
  const [isCityOpen, setIsCityOpen] = useState(false);
  const cityContainerRef = useRef<HTMLDivElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(AddListingClientSchema) as unknown as Resolver<FormValues>,
    mode: 'onBlur',
    defaultValues: {
      name: '',
      city: '' as FormValues['city'],
      area: '',
      whatsappNumber: '',
      isVegetarian: true,
      hasNonVeg: false,
      mealsOffered: [],
      offerings: [],
      spiceLevel: undefined,
      containerType: undefined,
      requiresTiffinWash: undefined,
      operationalDays: [],
      deliveryAreas: [],
      description: '',
      submitterNote: '',
      r2Keys: [],
      honeypot: '',
    },
  });

  const {
    register,
    control,
    handleSubmit,
    trigger,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  const [customSizeName, setCustomSizeName] = useState('');
  const [expandedOfferings, setExpandedOfferings] = useState<Record<string, boolean>>({});
  const [exitingCardIds, setExitingCardIds] = useState<string[]>([]);
  const [completedEntranceIds, setCompletedEntranceIds] = useState<string[]>([]);

  function toggleExpandOffering(id: string) {
    setExpandedOfferings((prev) => ({
      ...prev,
      [id]: !(prev[id] ?? true),
    }));
  }

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'offerings',
  });

  const isFullTiffinSelected = fields.some((f) => f.sizeName === 'Full tiffin');
  const isHalfTiffinSelected = fields.some((f) => f.sizeName === 'Half tiffin');

  function togglePresetSize(sizeLabel: 'Full tiffin' | 'Half tiffin') {
    const idx = fields.findIndex((f) => f.sizeName === sizeLabel);
    if (idx !== -1) {
      remove(idx);
    } else {
      append({
        sizeName: sizeLabel,
        mealComponents: [],
        pricePerMeal: undefined,
        pricePerMonth: undefined,
      }, {
        focusName: `offerings.${fields.length}.mealComponents`
      });
    }
  }

  function handleAddCustomSize() {
    const name = customSizeName.trim();
    if (!name) return;
    if (fields.some((f) => f.sizeName.toLowerCase() === name.toLowerCase())) {
      return;
    }
    append({
      sizeName: name,
      mealComponents: [],
      pricePerMeal: undefined,
      pricePerMonth: undefined,
    }, {
      focusName: `offerings.${fields.length}.mealComponents`
    });
    setCustomSizeName('');
  }

  const containerType = watch('containerType');
  const isVegetarian = watch('isVegetarian');
  const hasNonVeg = watch('hasNonVeg');
  const selectedCity = watch('city');

  useEffect(() => {
    const match = CITIES.find((c) => c.value === selectedCity);
    if (match) {
      setCityQuery(match.label);
    } else if (!selectedCity) {
      setCityQuery('');
    }
  }, [selectedCity]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cityContainerRef.current && !cityContainerRef.current.contains(event.target as Node)) {
        setIsCityOpen(false);
        const match = CITIES.find((c) => c.value === selectedCity);
        setCityQuery(match ? match.label : '');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedCity]);

  const filteredCities = cityQuery === '' || (selectedCity && CITIES.find(c => c.value === selectedCity)?.label === cityQuery)
    ? CITIES
    : CITIES.filter((c) =>
      c.label.toLowerCase().includes(cityQuery.toLowerCase())
    );

  // Derive the single veg radio selection from the two boolean schema fields.
  const vegChoice = isVegetarian && !hasNonVeg ? 'veg' : 'mixed';

  function setVegChoice(choice: 'veg' | 'mixed') {
    if (choice === 'veg') {
      setValue('isVegetarian', true);
      setValue('hasNonVeg', false);
    } else {
      setValue('isVegetarian', true);
      setValue('hasNonVeg', true);
    }
  }

  async function goNext() {
    // Validate ONLY the current step's fields before advancing.
    const valid = await trigger(stepFields[step]);
    if (valid) setStep((s) => Math.min(3, s + 1) as Step);
  }

  function goBack() {
    setStep((s) => Math.max(1, s - 1) as Step);
  }

  function handleUploadComplete(keys: string[]) {
    setUploadedKeys(keys);
    setValue('r2Keys', keys, { shouldValidate: true });
  }

  async function onSubmit(values: AddListingClientInput) {
    // Guard: only the final step may submit. Protects against the browser
    // completing an in-flight click on a button whose type changed to "submit"
    // during a step transition.
    if (step !== 3) return;
    setSubmitError(null);

    const payload = {
      ...values,
      r2Keys: uploadedKeys,
      honeypot: form.getValues('honeypot'),
    };

    const res = await fetch('/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    // Only 201 is a real, persisted submission. The server's 200 is exclusively
    // the silent honeypot path and must never be reached by the legitimate flow.
    if (res.status === 201) {
      router.push('/add/submitted');
      return;
    }
    if (res.status === 429) {
      setSubmitError("You've submitted 5 listings today. Try again tomorrow.");
      return;
    }
    if (res.status === 400) {
      const { error } = await res.json();
      Object.entries(error as Record<string, string[]>).forEach(([field, messages]) => {
        form.setError(field as keyof AddListingClientInput, { message: messages[0] });
      });
      return;
    }
    setSubmitError('Something went wrong. Please try again.');
  }

  return (
    <form onSubmit={handleSubmit(onSubmit as (v: FormValues) => void)} className="flex flex-col gap-4" noValidate>
      <StepWizard currentStep={step} totalSteps={3} stepTitles={STEP_TITLES} />

      {/* ───────── Step 1: Basic info ───────── */}
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <Controller
            name="name"
            control={control}
            render={({ field: { ref, ...field }, fieldState }) => (
              <Input
                label="Service name"
                placeholder="e.g. Aunty's Kitchen Special"
                icon={<Store size={18} />}
                {...field}
                value={field.value ?? ''}
                maxLength={120}
                required
                error={fieldState.error?.message}
              />
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* City Autocomplete Dropdown */}
            <div className="flex flex-col gap-1 relative" ref={cityContainerRef}>
              <label htmlFor="city-search" className="text-sm font-semibold text-slate-700 mb-1">
                City
              </label>
              <div className="relative flex items-center w-full">
                <span className="absolute left-3.5 text-slate-400 pointer-events-none z-10">
                  <MapPin size={18} />
                </span>
                <input
                  id="city-search"
                  type="text"
                  placeholder="Type to search city..."
                  value={cityQuery}
                  onFocus={() => setIsCityOpen(true)}
                  onChange={(e) => {
                    setCityQuery(e.target.value);
                    setIsCityOpen(true);
                    if (e.target.value === '') {
                      setValue('city', '' as any, { shouldValidate: true });
                    }
                  }}
                  className={cn(
                    FIELD_BASE,
                    'w-full pl-10 border-slate-200 placeholder-slate-400',
                    errors.city ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                  )}
                  aria-invalid={errors.city ? true : undefined}
                  aria-describedby={errors.city ? 'city-error' : undefined}
                  autoComplete="off"
                  suppressHydrationWarning
                />
              </div>

              {/* Hidden input to register city with React Hook Form */}
              <input type="hidden" {...register('city')} />

              {/* Autocomplete Suggestions Popup */}
              {isCityOpen && (
                <ul className="absolute top-[72px] left-0 right-0 z-50 max-h-56 overflow-y-auto rounded-2xl border border-slate-200 bg-white py-1.5 shadow-lg focus:outline-none text-sm">
                  {filteredCities.length === 0 ? (
                    cityQuery.trim() !== '' && (
                      <li
                        onClick={() => {
                          setValue('city', cityQuery.trim() as any, { shouldValidate: true });
                          setIsCityOpen(false);
                        }}
                        className="relative cursor-default select-none py-2.5 pl-4 pr-4 hover:bg-slate-50 cursor-pointer font-semibold text-[#0f172a] transition-colors"
                      >
                        Use "{cityQuery}" as my city
                      </li>
                    )
                  ) : (
                    <>
                      {filteredCities.map((c) => {
                        const isSelected = selectedCity === c.value;
                        return (
                          <li
                            key={c.value}
                            onClick={() => {
                              setValue('city', c.value as any, { shouldValidate: true });
                              setCityQuery(c.label);
                              setIsCityOpen(false);
                            }}
                            className={cn(
                              "relative cursor-default select-none py-2.5 pl-10 pr-4 hover:bg-slate-50 cursor-pointer font-medium transition-colors",
                              isSelected ? "text-[#0f172a] bg-slate-50 font-semibold" : "text-slate-700"
                            )}
                          >
                            {isSelected && (
                              <span className="absolute inset-y-0 left-3.5 flex items-center text-[#0f172a]">
                                ✓
                              </span>
                            )}
                            {c.label}
                          </li>
                        );
                      })}
                      {cityQuery.trim() !== '' && !CITIES.some(c => c.label.toLowerCase() === cityQuery.trim().toLowerCase()) && (
                        <li
                          onClick={() => {
                            setValue('city', cityQuery.trim() as any, { shouldValidate: true });
                            setIsCityOpen(false);
                          }}
                          className="relative cursor-default select-none py-2.5 pl-4 pr-4 hover:bg-slate-50 cursor-pointer font-semibold text-[#0f172a] border-t border-slate-100 transition-colors"
                        >
                          Use "{cityQuery}" as my city
                        </li>
                      )}
                    </>
                  )}
                </ul>
              )}
              {errors.city && (
                <p id="city-error" role="alert" className="text-sm text-red-600 mt-1">
                  {errors.city.message}
                </p>
              )}
            </div>

            <Controller
              name="area"
              control={control}
              render={({ field: { ref, ...field }, fieldState }) => (
                <Input
                  label="Area / Neighbourhood (optional)"
                  placeholder="e.g. Andheri East"
                  icon={<MapPin size={18} />}
                  {...field}
                  value={field.value ?? ''}
                  maxLength={80}
                  error={fieldState.error?.message}
                />
              )}
            />
          </div>

          <Controller
            name="whatsappNumber"
            control={control}
            render={({ field: { ref, onChange, ...field }, fieldState }) => (
              <Input
                label="WhatsApp number"
                type="tel"
                placeholder="e.g. 9876543210"
                icon={<Phone size={18} />}
                prefix="+91"
                {...field}
                value={field.value ?? ''}
                onChange={(e) => {
                  let val = e.target.value.replace(/[\s()-]/g, '');
                  if (val.startsWith('+91')) {
                    val = val.substring(3);
                  } else if (val.startsWith('91') && val.length > 10) {
                    val = val.substring(2);
                  }
                  onChange(val.slice(0, 10));
                }}
                required
                error={fieldState.error?.message}
              />
            )}
          />

          <fieldset className="flex flex-col gap-2 border-0 p-0">
            <legend className="text-sm font-semibold text-slate-700 mb-1.5">Vegetarian option</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  label: 'Yes, pure veg',
                  value: 'veg',
                  symbol: (
                    <span className="w-5 h-5 border-2 border-emerald-600 rounded flex items-center justify-center shrink-0 p-0.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    </span>
                  )
                },
                {
                  label: 'No, mixed (veg & non-veg)',
                  value: 'mixed',
                  symbol: (
                    <span className="w-5 h-5 border-2 border-amber-600 rounded flex items-center justify-center shrink-0 p-0.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                    </span>
                  )
                },
              ].map((opt) => {
                const isChecked = vegChoice === opt.value;
                return (
                  <label
                    key={opt.value}
                    className={cn(
                      checkboxBase,
                      "py-3.5 px-5 flex items-center gap-3.5 transition-all",
                      isChecked ? "border-[#6aa337] bg-[#eef5e6] text-[#2d5c10] shadow-sm" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    )}
                  >
                    <input
                      type="radio"
                      name="vegChoice"
                      value={opt.value}
                      checked={isChecked}
                      onChange={() => setVegChoice(opt.value as 'veg' | 'mixed')}
                      className="sr-only"
                    />
                    {opt.symbol}
                    <span className="font-bold text-sm">{opt.label}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        </div>
      )}

      {/* ───────── Step 2: Service details ───────── */}
      {step === 2 && (
        <div className="flex flex-col gap-4">
          {/* Sub-card A: Menu & Offerings */}
          <div className="bg-slate-50/40 rounded-2xl border border-slate-100 p-4 md:p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6aa337] flex items-center gap-2">
                <span className="w-1.5 h-4 bg-[#6aa337] rounded-full shrink-0" />
                Menu & Offerings
              </h3>
              <button
                type="button"
                onClick={goBack}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer focus:outline-none"
              >
                ← Back
              </button>
            </div>

            <fieldset className="flex flex-col gap-2 border-0 p-0">
              <legend className="text-sm font-semibold text-slate-700 mb-1.5">Meals offered</legend>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {MEALS.map((m) => (
                  <label key={m.value} className={checkboxClass}>
                    <input
                      type="checkbox"
                      value={m.value}
                      {...register('mealsOffered')}
                      className="sr-only"
                    />
                    {m.label}
                  </label>
                ))}
              </div>
              {errors.mealsOffered && (
                <p role="alert" className="text-sm text-red-600">
                  {errors.mealsOffered.message}
                </p>
              )}
            </fieldset>

            {/* Tiffin sizes selector */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-slate-700 mb-1">Meal sizes</span>
              <div className="flex flex-col gap-3">
                {/* Predefined sizes chips */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Full tiffin', isSelected: isFullTiffinSelected },
                    { label: 'Half tiffin', isSelected: isHalfTiffinSelected },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => togglePresetSize(preset.label as 'Full tiffin' | 'Half tiffin')}
                      className={cn(
                        "inline-flex items-center justify-center rounded-xl border px-4 py-2.5 text-sm font-semibold cursor-pointer transition-all active:scale-[0.98] shadow-[0_1px_2px_rgba(0,0,0,0.02)] select-none",
                        preset.isSelected
                          ? "border-[#6aa337] bg-[#6aa337] text-white"
                          : "border-slate-200 bg-white text-slate-700"
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Custom size input */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Add custom size (e.g. Jain Thali)..."
                      value={customSizeName}
                      onChange={(e) => setCustomSizeName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomSize();
                        }
                      }}
                      className={cn(
                        FIELD_BASE,
                        'w-full border-slate-200 placeholder-slate-400'
                      )}
                      suppressHydrationWarning
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCustomSize}
                    className="rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800 transition-colors active:scale-[0.98]"
                  >
                    Add
                  </button>
                </div>
              </div>
              {errors.offerings && (
                <p role="alert" className="text-sm text-red-600 mt-1">
                  {errors.offerings.message || errors.offerings.root?.message}
                </p>
              )}
            </div>

            {/* Offerings list */}
            {fields.map((field, index) => {
              const isExpanded = expandedOfferings[field.id] ?? true;
              const isExiting = exitingCardIds.includes(field.id);
              const hasCompletedEntrance = completedEntranceIds.includes(field.id);
              return (
                <div
                  key={field.id}
                  className={cn(
                    "bg-white rounded-xl border border-slate-200 shadow-sm transition-all duration-300 ease-in-out flex flex-col overflow-hidden",
                    isExiting
                      ? "max-h-0 opacity-0 py-0 border-transparent shadow-none scale-95 my-0 gap-0"
                      : isExpanded
                        ? cn("max-h-[400px] pt-4 pb-4 md:pt-5 md:pb-5 px-4 md:px-5 gap-4", !hasCompletedEntrance && "animate-card-enter")
                        : cn("max-h-[60px] py-3 px-4 gap-0", !hasCompletedEntrance && "animate-card-enter")
                  )}
                  onAnimationEnd={() => {
                    setCompletedEntranceIds((prev) => [...prev, field.id]);
                  }}
                >
                  <div className={cn(
                    "flex items-center justify-between border-b transition-all duration-300",
                    isExpanded ? "border-slate-100 pb-2" : "border-transparent pb-0"
                  )}>
                    <button
                      type="button"
                      onClick={() => toggleExpandOffering(field.id)}
                      className="text-sm font-bold text-slate-800 flex items-center gap-2 hover:text-[#6aa337] transition-colors focus:outline-none cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      <span className="w-1.5 h-3.5 bg-[#6aa337] rounded-full shrink-0" />
                      <span>{field.sizeName}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const cardId = field.id;
                        setExitingCardIds((prev) => [...prev, cardId]);
                        setTimeout(() => {
                          const currentIndex = fields.findIndex((f) => f.id === cardId);
                          if (currentIndex !== -1) {
                            remove(currentIndex);
                          }
                          setExitingCardIds((prev) => prev.filter((id) => id !== cardId));
                          setCompletedEntranceIds((prev) => prev.filter((id) => id !== cardId));
                        }, 300);
                      }}
                      className="text-red-700 bg-red-100 hover:bg-red-50 transition-all rounded-lg p-1.5 cursor-pointer focus:outline-none"
                      aria-label="Remove offering"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div
                    className={cn(
                      "grid transition-all duration-300 ease-in-out",
                      isExpanded ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0 mt-0"
                    )}
                  >
                    <div className="overflow-hidden flex flex-col gap-4">
                      <Controller
                        name={`offerings.${index}.mealComponents`}
                        control={control}
                        render={({ field: subField, fieldState }) => (
                          <TagInput
                            ref={subField.ref}
                            label="What this meal includes"
                            name={`offerings.${index}.mealComponents`}
                            value={subField.value ?? []}
                            onChange={subField.onChange}
                            maxTags={10}
                            lowercase
                            placeholder="e.g. roti, sabji (press Enter to add)"
                            icon={<UtensilsCrossed size={18} />}
                            noun="items"
                            error={fieldState.error?.message}
                          />
                        )}
                      />

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Controller
                          name={`offerings.${index}.pricePerMeal`}
                          control={control}
                          render={({ field: subField, fieldState }) => (
                            <Input
                              label="Price per meal (optional)"
                              type="number"
                              min={1}
                              placeholder="e.g. 80"
                              icon={<IndianRupee size={18} />}
                              {...subField}
                              value={subField.value ?? ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                subField.onChange(val === '' ? undefined : Number(val));
                              }}
                              error={fieldState.error?.message}
                            />
                          )}
                        />

                        <Controller
                          name={`offerings.${index}.pricePerMonth`}
                          control={control}
                          render={({ field: subField, fieldState }) => (
                            <Input
                              label="Price per month (optional)"
                              type="number"
                              min={1}
                              placeholder="e.g. 2400"
                              icon={<IndianRupee size={18} />}
                              {...subField}
                              value={subField.value ?? ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                subField.onChange(val === '' ? undefined : Number(val));
                              }}
                              error={fieldState.error?.message}
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sub-card B: Service Details */}
          <div className="bg-slate-50/40 rounded-2xl border border-slate-100 p-5 md:p-6 flex flex-col gap-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6aa337] flex items-center gap-2 mb-1">
              <span className="w-1.5 h-4 bg-[#6aa337] rounded-full shrink-0" />
              Service Details
            </h3>

            <Controller
              name="spiceLevel"
              control={control}
              render={({ field }) => (
                <fieldset className="flex flex-col gap-2 border-0 p-0">
                  <legend className="text-sm font-semibold text-slate-700 mb-1.5">Spice level</legend>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Mild', value: 'MILD' },
                      { label: 'Normal', value: 'MEDIUM' },
                      { label: 'Spicy', value: 'SPICY' },
                      { label: 'Unsure', value: '' },
                    ].map((opt) => (
                      <label key={opt.label} className={checkboxClass}>
                        <input
                          type="radio"
                          name="spiceLevel"
                          value={opt.value}
                          checked={(field.value ?? '') === opt.value}
                          onChange={() => field.onChange(opt.value === '' ? undefined : opt.value)}
                          className="sr-only"
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}
            />

            <fieldset className="flex flex-col gap-2 border-0 p-0">
              <legend className="text-sm font-semibold text-slate-700 mb-1.5">Operational days</legend>
              <div className="grid grid-cols-4 gap-2">
                {OPERATIONAL_DAYS.map((d) => (
                  <label key={d.value} className={checkboxClass}>
                    <input
                      type="checkbox"
                      value={d.value}
                      {...register('operationalDays')}
                      className="sr-only"
                    />
                    {d.label}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          {/* Sub-card C: Logistics */}
          <div className="bg-slate-50/40 rounded-2xl border border-slate-100 p-4 md:p-5 flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6aa337] flex items-center gap-2 mb-1">
              <span className="w-1.5 h-4 bg-[#6aa337] rounded-full shrink-0" />
              Logistics
            </h3>

            <Controller
              name="containerType"
              control={control}
              render={({ field }) => (
                <fieldset className="flex flex-col gap-2 border-0 p-0">
                  <legend className="text-sm font-semibold text-slate-700 mb-1.5">Container type</legend>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { label: 'Steel tiffin', value: 'STEEL' },
                      { label: 'Disposable', value: 'DISPOSABLE' },
                      { label: 'Not sure', value: '' },
                    ].map((opt) => (
                      <label key={opt.label} className={checkboxClass}>
                        <input
                          type="radio"
                          name="containerType"
                          value={opt.value}
                          checked={(field.value ?? '') === opt.value}
                          onChange={() => {
                            const next = opt.value === '' ? undefined : opt.value;
                            field.onChange(next);
                            // Tiffin-wash only applies to steel containers.
                            if (next !== 'STEEL') setValue('requiresTiffinWash', undefined);
                          }}
                          className="sr-only"
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}
            />

            {containerType === 'STEEL' && (
              <Controller
                name="requiresTiffinWash"
                control={control}
                render={({ field }) => (
                  <fieldset className="flex flex-col gap-2 border-0 p-0">
                    <legend className="text-sm font-semibold text-slate-700 mb-1.5">Tiffin wash required?</legend>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Yes', value: 'yes' },
                        { label: 'No', value: 'no' },
                      ].map((opt) => (
                        <label key={opt.value} className={checkboxClass}>
                          <input
                            type="radio"
                            name="requiresTiffinWash"
                            value={opt.value}
                            checked={
                              field.value === undefined ? false : field.value === (opt.value === 'yes')
                            }
                            onChange={() => field.onChange(opt.value === 'yes')}
                            className="sr-only"
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                )}
              />
            )}


          </div>
        </div>
      )}

      {/* ───────── Step 3: Delivery & images ───────── */}
      {step === 3 && (
        <div className="flex flex-col gap-4">
          <div className="bg-slate-50/40 rounded-2xl border border-slate-100 p-4 md:p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6aa337] flex items-center gap-2">
                <span className="w-1.5 h-4 bg-[#6aa337] rounded-full shrink-0" />
                Delivery & Images
              </h3>
              <button
                type="button"
                onClick={goBack}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer focus:outline-none"
              >
                ← Back
              </button>
            </div>
            <Controller
              name="deliveryAreas"
              control={control}
              render={({ field, fieldState }) => (
                <TagInput
                  label="Delivery areas (up to 10)"
                  name="deliveryAreas"
                  value={field.value ?? []}
                  onChange={field.onChange}
                  maxTags={10}
                  noun="areas"
                  placeholder="e.g. Bandra West, Andheri East (press Enter to add)"
                  error={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field: { ref, ...field }, fieldState }) => (
                <Textarea
                  label="Description (optional)"
                  placeholder="Describe your meals, daily schedules, custom tiffin menus, delivery timings, etc."
                  {...field}
                  value={field.value ?? ''}
                  maxLength={800}
                  error={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="submitterNote"
              control={control}
              render={({ field: { ref, ...field }, fieldState }) => (
                <Textarea
                  label="Note to reviewer (optional)"
                  placeholder="Any special remarks or details for our validation team..."
                  hint="This is only seen by our team."
                  {...field}
                  value={field.value ?? ''}
                  maxLength={300}
                  error={fieldState.error?.message}
                />
              )}
            />

            <ImageUploader
              maxFiles={5}
              maxSizeMB={5}
              context="listing"
              onUploadComplete={handleUploadComplete}
              label="Photos (optional, up to 5)"
            />
          </div>

          {/* Honeypot — visually hidden, never shown to users; server-side trap. */}
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute left-[-9999px] opacity-0 pointer-events-none"
            {...register('honeypot')}
            suppressHydrationWarning
          />
        </div>
      )}

      {submitError && (
        <p role="alert" className="rounded-xl bg-red-50 border border-red-200/50 px-4 py-3 text-sm text-red-700 shadow-sm">
          {submitError}
        </p>
      )}

      {/* Navigation */}
      <div className="flex flex-col items-center gap-3 mt-2.5 w-full">
        {step < 3 ? (
          // Distinct keys force React to render separate DOM nodes for the
          // Next and Submit buttons. Without this, React reuses the same
          // <button> element and flips its type to "submit" mid-click,
          // causing the form to submit itself on the step 2 → 3 transition.
          <Button key="next" type="button" variant="dark" onClick={goNext} className="w-[70%] text-center">
            Next
          </Button>
        ) : (
          <Button key="submit" type="submit" variant="dark" disabled={isSubmitting} className="w-[70%] text-center">
            {isSubmitting ? 'Submitting…' : 'Submit listing'}
          </Button>
        )}


      </div>
    </form>
  );
}
