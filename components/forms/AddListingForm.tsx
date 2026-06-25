'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, type Resolver } from 'react-hook-form';
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

// The form carries the honeypot field in addition to the validated client schema.
// The Zod resolver validates ONLY AddListingClientSchema (honeypot excluded), so
// browser autofill of the hidden trap can never block a real user's submission.
type FormValues = AddListingClientInput & { honeypot: string };

type Step = 1 | 2 | 3;

const CITIES = [
  { label: 'Mumbai', value: 'mumbai' },
  { label: 'Delhi', value: 'delhi' },
  { label: 'Bangalore', value: 'bangalore' },
  { label: 'Hyderabad', value: 'hyderabad' },
  { label: 'Pune', value: 'pune' },
  { label: 'Chennai', value: 'chennai' },
  { label: 'Ahmedabad', value: 'ahmedabad' },
  { label: 'Kolkata', value: 'kolkata' },
  { label: 'Other', value: 'other' },
] as const;

const MEALS = [
  { label: 'Breakfast', value: 'BREAKFAST' },
  { label: 'Lunch', value: 'LUNCH' },
  { label: 'Dinner', value: 'DINNER' },
] as const;

const MEAL_SIZES = [
  { label: 'Full tiffin', value: 'FULL' },
  { label: 'Half tiffin', value: 'HALF' },
] as const;

const MEAL_COMPONENTS = [
  { label: 'Roti', value: 'ROTI' },
  { label: 'Sabji', value: 'SABJI' },
  { label: 'Rice', value: 'RICE' },
  { label: 'Dal', value: 'DAL' },
  { label: 'Salad', value: 'SALAD' },
  { label: 'Dessert', value: 'DESSERT' },
  { label: 'Other', value: 'OTHER' },
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
    'mealSizes',
    'mealComponents',
    'spiceLevel',
    'containerType',
    'requiresTiffinWash',
    'operationalDays',
    'pricePerMeal',
    'pricePerMonth',
  ],
  3: ['deliveryAreas', 'description', 'submitterNote', 'r2Keys'],
};

const checkboxClass =
  'inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-body cursor-pointer hover:bg-gray-50 has-[:checked]:border-brand-peridot has-[:checked]:bg-brand-peridot/10';

export function AddListingForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [uploadedKeys, setUploadedKeys] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
      mealSizes: [],
      mealComponents: [],
      spiceLevel: undefined,
      containerType: undefined,
      requiresTiffinWash: undefined,
      operationalDays: [],
      pricePerMeal: undefined,
      pricePerMonth: undefined,
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

  const containerType = watch('containerType');
  const isVegetarian = watch('isVegetarian');
  const hasNonVeg = watch('hasNonVeg');

  // Derive the single veg radio selection from the two boolean schema fields.
  const vegChoice = isVegetarian && !hasNonVeg ? 'veg' : isVegetarian && hasNonVeg ? 'mixed' : 'nonveg';

  function setVegChoice(choice: 'veg' | 'mixed' | 'nonveg') {
    if (choice === 'veg') {
      setValue('isVegetarian', true);
      setValue('hasNonVeg', false);
    } else if (choice === 'mixed') {
      setValue('isVegetarian', true);
      setValue('hasNonVeg', true);
    } else {
      setValue('isVegetarian', false);
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
    <form onSubmit={handleSubmit(onSubmit as (v: FormValues) => void)} className="flex flex-col gap-8" noValidate>
      <StepWizard currentStep={step} totalSteps={3} stepTitles={STEP_TITLES} />

      {/* ───────── Step 1: Basic info ───────── */}
      {step === 1 && (
        <div className="flex flex-col gap-5">
          <Controller
            name="name"
            control={control}
            render={({ field: { ref, ...field }, fieldState }) => (
              <Input
                label="Service name"
                {...field}
                value={field.value ?? ''}
                maxLength={120}
                required
                error={fieldState.error?.message}
              />
            )}
          />

          <div className="flex flex-col gap-1">
            <label htmlFor="city" className="text-sm font-medium text-body">
              City
            </label>
            <select
              id="city"
              {...register('city')}
              aria-invalid={errors.city ? true : undefined}
              aria-describedby={errors.city ? 'city-error' : undefined}
              className={cn(FIELD_BASE, errors.city ? 'border-red-500' : 'border-gray-300')}
            >
              <option value="">Select a city…</option>
              {CITIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            {errors.city && (
              <p id="city-error" role="alert" className="text-sm text-red-600">
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
                {...field}
                value={field.value ?? ''}
                maxLength={80}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="whatsappNumber"
            control={control}
            render={({ field: { ref, onChange, ...field }, fieldState }) => (
              <Input
                label="WhatsApp number"
                type="tel"
                {...field}
                value={field.value ?? ''}
                // Strip spaces, dashes and parentheses so user-friendly input like
                // "+91 98765 43210" still satisfies the strict E.164 rule.
                onChange={(e) => onChange(e.target.value.replace(/[\s()-]/g, ''))}
                required
                hint="Include country code, e.g. +919876543210"
                error={fieldState.error?.message}
              />
            )}
          />

          <fieldset className="flex flex-col gap-2 border-0 p-0">
            <legend className="text-sm font-medium text-body">Pure vegetarian?</legend>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Yes — pure veg', value: 'veg' },
                { label: 'Mixed (veg & non-veg)', value: 'mixed' },
                { label: 'No — non-veg', value: 'nonveg' },
              ].map((opt) => (
                <label key={opt.value} className={checkboxClass}>
                  <input
                    type="radio"
                    name="vegChoice"
                    value={opt.value}
                    checked={vegChoice === opt.value}
                    onChange={() => setVegChoice(opt.value as 'veg' | 'mixed' | 'nonveg')}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      )}

      {/* ───────── Step 2: Service details ───────── */}
      {step === 2 && (
        <div className="flex flex-col gap-5">
          <fieldset className="flex flex-col gap-2 border-0 p-0">
            <legend className="text-sm font-medium text-body">Meals offered</legend>
            <div className="flex flex-wrap gap-2">
              {MEALS.map((m) => (
                <label key={m.value} className={checkboxClass}>
                  <input type="checkbox" value={m.value} {...register('mealsOffered')} />
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

          <fieldset className="flex flex-col gap-2 border-0 p-0">
            <legend className="text-sm font-medium text-body">Meal sizes</legend>
            <div className="flex flex-wrap gap-2">
              {MEAL_SIZES.map((s) => (
                <label key={s.value} className={checkboxClass}>
                  <input type="checkbox" value={s.value} {...register('mealSizes')} />
                  {s.label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-2 border-0 p-0">
            <legend className="text-sm font-medium text-body">What each meal includes</legend>
            <div className="flex flex-wrap gap-2">
              {MEAL_COMPONENTS.map((c) => (
                <label key={c.value} className={checkboxClass}>
                  <input type="checkbox" value={c.value} {...register('mealComponents')} />
                  {c.label}
                </label>
              ))}
            </div>
          </fieldset>

          <Controller
            name="spiceLevel"
            control={control}
            render={({ field }) => (
              <fieldset className="flex flex-col gap-2 border-0 p-0">
                <legend className="text-sm font-medium text-body">Spice level</legend>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Mild', value: 'MILD' },
                    { label: 'Medium', value: 'MEDIUM' },
                    { label: 'Spicy', value: 'SPICY' },
                    { label: 'Not sure', value: '' },
                  ].map((opt) => (
                    <label key={opt.label} className={checkboxClass}>
                      <input
                        type="radio"
                        name="spiceLevel"
                        value={opt.value}
                        checked={(field.value ?? '') === opt.value}
                        onChange={() => field.onChange(opt.value === '' ? undefined : opt.value)}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
          />

          <Controller
            name="containerType"
            control={control}
            render={({ field }) => (
              <fieldset className="flex flex-col gap-2 border-0 p-0">
                <legend className="text-sm font-medium text-body">Container type</legend>
                <div className="flex flex-wrap gap-2">
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
                  <legend className="text-sm font-medium text-body">Tiffin wash required?</legend>
                  <div className="flex flex-wrap gap-2">
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
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}
            />
          )}

          <fieldset className="flex flex-col gap-2 border-0 p-0">
            <legend className="text-sm font-medium text-body">Operational days</legend>
            <div className="flex flex-wrap gap-2">
              {OPERATIONAL_DAYS.map((d) => (
                <label key={d.value} className={checkboxClass}>
                  <input type="checkbox" value={d.value} {...register('operationalDays')} />
                  {d.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="pricePerMeal" className="text-sm font-medium text-body">
                Price per meal (₹, optional)
              </label>
              <input
                id="pricePerMeal"
                type="number"
                min={1}
                {...register('pricePerMeal', {
                  setValueAs: (v) => (v === '' || v == null ? undefined : Number(v)),
                })}
                className={cn(FIELD_BASE, errors.pricePerMeal ? 'border-red-500' : 'border-gray-300')}
              />
              {errors.pricePerMeal && (
                <p role="alert" className="text-sm text-red-600">
                  {errors.pricePerMeal.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="pricePerMonth" className="text-sm font-medium text-body">
                Price per month (₹, optional)
              </label>
              <input
                id="pricePerMonth"
                type="number"
                min={1}
                {...register('pricePerMonth', {
                  setValueAs: (v) => (v === '' || v == null ? undefined : Number(v)),
                })}
                className={cn(FIELD_BASE, errors.pricePerMonth ? 'border-red-500' : 'border-gray-300')}
              />
              {errors.pricePerMonth && (
                <p role="alert" className="text-sm text-red-600">
                  {errors.pricePerMonth.message}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ───────── Step 3: Delivery & images ───────── */}
      {step === 3 && (
        <div className="flex flex-col gap-5">
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

          {/* Honeypot — visually hidden, never shown to users; server-side trap. */}
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ display: 'none' }}
            {...register('honeypot')}
          />
        </div>
      )}

      {submitError && (
        <p role="alert" className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </p>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        {step > 1 ? (
          <Button type="button" variant="secondary" onClick={goBack}>
            Back
          </Button>
        ) : (
          <span />
        )}

        {step < 3 ? (
          // Distinct keys force React to render separate DOM nodes for the
          // Next and Submit buttons. Without this, React reuses the same
          // <button> element and flips its type to "submit" mid-click,
          // causing the form to submit itself on the step 2 → 3 transition.
          <Button key="next" type="button" onClick={goNext}>
            Next
          </Button>
        ) : (
          <Button key="submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting…' : 'Submit listing'}
          </Button>
        )}
      </div>
    </form>
  );
}
