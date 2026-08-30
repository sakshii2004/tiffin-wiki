'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/providers/ToastProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Edit, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { toTitleCase } from '@/lib/titleCase';

export interface AdminEditInitialValues {
  name: string;
  city: string;
  area: string;
  whatsappNumber: string;
  description: string;
  isVegetarian: boolean;
  hasNonVeg: boolean;
  mealsOffered: string[];
  operationalDays: string[];
  containerType: string;
  spiceLevel: string;
  requiresTiffinWash?: boolean | null;
  deliveryAreas: string[];
  submitterNote: string;
  adminNote: string;
  offerings: {
    sizeName: string;
    mealComponents: string[];
    pricePerMeal?: number | null;
    pricePerMonth?: number | null;
  }[];
}

interface AdminEditFormProps {
  listingId: string;
  initial: AdminEditInitialValues;
}

const ALL_MEALS = ['BREAKFAST', 'LUNCH', 'DINNER'] as const;
const ALL_DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const;

export function AdminEditForm({ listingId, initial }: AdminEditFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states
  const [name, setName] = useState(initial.name);
  const [city, setCity] = useState(initial.city);
  const [area, setArea] = useState(initial.area ?? '');
  const [whatsappNumber, setWhatsappNumber] = useState(initial.whatsappNumber);
  const [description, setDescription] = useState(initial.description ?? '');

  const [isVegetarian, setIsVegetarian] = useState(initial.isVegetarian);
  const [hasNonVeg, setHasNonVeg] = useState(initial.hasNonVeg);
  const [mealsOffered, setMealsOffered] = useState<string[]>(initial.mealsOffered);
  const [operationalDays, setOperationalDays] = useState<string[]>(initial.operationalDays);

  const [containerType, setContainerType] = useState<string>(initial.containerType ?? '');
  const [spiceLevel, setSpiceLevel] = useState<string>(initial.spiceLevel ?? '');
  const [requiresTiffinWash, setRequiresTiffinWash] = useState<string>(
    initial.requiresTiffinWash === true ? 'true' : initial.requiresTiffinWash === false ? 'false' : ''
  );
  const [deliveryAreasInput, setDeliveryAreasInput] = useState(initial.deliveryAreas ? initial.deliveryAreas.join(', ') : '');

  const [submitterNote, setSubmitterNote] = useState(initial.submitterNote ?? '');
  const [adminNote, setAdminNote] = useState(initial.adminNote ?? '');

  const [offerings, setOfferings] = useState(
    initial.offerings.map((o) => ({
      sizeName: o.sizeName,
      componentsText: o.mealComponents.join(', '),
      pricePerMeal: o.pricePerMeal != null ? String(o.pricePerMeal) : '',
      pricePerMonth: o.pricePerMonth != null ? String(o.pricePerMonth) : '',
    }))
  );

  const toggleMeal = (meal: string) => {
    setMealsOffered((prev) =>
      prev.includes(meal) ? prev.filter((m) => m !== meal) : [...prev, meal]
    );
  };

  const toggleDay = (day: string) => {
    setOperationalDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const addOffering = () => {
    setOfferings((prev) => [
      ...prev,
      { sizeName: 'Standard', componentsText: 'Roti, Sabzi, Rice, Dal', pricePerMeal: '', pricePerMonth: '' },
    ]);
  };

  const removeOffering = (index: number) => {
    setOfferings((prev) => prev.filter((_, i) => i !== index));
  };

  const updateOffering = (index: number, field: string, value: string) => {
    setOfferings((prev) =>
      prev.map((off, i) => (i === index ? { ...off, [field]: value } : off))
    );
  };

  async function handleSave() {
    setSaving(true);

    const deliveryAreas = deliveryAreasInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const formattedOfferings = offerings.map((o) => ({
      sizeName: o.sizeName.trim() || 'Standard',
      mealComponents: o.componentsText.split(',').map((c) => c.trim()).filter(Boolean),
      pricePerMeal: o.pricePerMeal ? parseInt(o.pricePerMeal, 10) : undefined,
      pricePerMonth: o.pricePerMonth ? parseInt(o.pricePerMonth, 10) : undefined,
    }));

    const patchPayload: Record<string, any> = {
      name: name.trim(),
      city: city.trim().toLowerCase(),
      area: area.trim() || undefined,
      whatsappNumber: whatsappNumber.trim(),
      description: description.trim() || undefined,
      isVegetarian,
      hasNonVeg,
      mealsOffered,
      operationalDays,
      containerType: containerType ? containerType : undefined,
      spiceLevel: spiceLevel ? spiceLevel : undefined,
      requiresTiffinWash: requiresTiffinWash === 'true' ? true : requiresTiffinWash === 'false' ? false : undefined,
      deliveryAreas,
      submitterNote: submitterNote.trim() || undefined,
      adminNote: adminNote.trim() || undefined,
      offerings: formattedOfferings,
    };

    const res = await fetch(`/api/listings/${listingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patchPayload),
    });

    setSaving(false);

    if (res.ok) {
      showToast('All changes saved successfully.', 'success');
      setOpen(false);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      showToast(data.error ? 'Validation failed. Check inputs.' : 'Could not save changes.', 'error');
    }
  }

  if (!open) {
    return (
      <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-[var(--shadow-soft)]">
        <Button
          variant="secondary"
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-center gap-2"
        >
          <Edit size={15} />
          Edit All Listing Fields
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-2xl border border-brand-peridot/30 bg-white p-6 shadow-md">
      <div className="flex items-center justify-between border-b pb-3">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Edit size={18} className="text-brand-peridot" />
          Edit All Fields
        </h2>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          Close Form ✕
        </button>
      </div>

      {/* 1. Basic Info */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">1. Basic Information</h3>
        <Input label="Name" name="name" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="City" name="city" value={city} onChange={(e) => setCity(e.target.value)} />
          <Input label="Area" name="area" value={area} onChange={(e) => setArea(e.target.value)} />
        </div>
        <Input label="WhatsApp Number" name="whatsappNumber" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} />
        <Textarea label="Description" name="description" value={description} maxLength={800} onChange={(e) => setDescription(e.target.value)} />
      </div>

      {/* 2. Dietary & Meals */}
      <div className="space-y-3 border-t pt-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">2. Dietary & Meals Offered</h3>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={isVegetarian}
              onChange={(e) => setIsVegetarian(e.target.checked)}
              className="h-4 w-4 rounded accent-[#6aa337]"
            />
            Pure Vegetarian
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={hasNonVeg}
              onChange={(e) => setHasNonVeg(e.target.checked)}
              className="h-4 w-4 rounded accent-[#6aa337]"
            />
            Offers Non-Veg Options
          </label>
        </div>

        <div className="space-y-1.5 pt-1">
          <span className="text-xs font-semibold text-slate-600">Meals Offered</span>
          <div className="flex flex-wrap gap-2">
            {ALL_MEALS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => toggleMeal(m)}
                className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  mealsOffered.includes(m)
                    ? 'bg-[#6aa337] text-white border-[#6aa337]'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                {toTitleCase(m)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5 pt-1">
          <span className="text-xs font-semibold text-slate-600">Operational Days</span>
          <div className="flex flex-wrap gap-1.5">
            {ALL_DAYS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => toggleDay(d)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  operationalDays.includes(d)
                    ? 'bg-[#6aa337] text-white border-[#6aa337]'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Service Attributes */}
      <div className="space-y-3 border-t pt-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">3. Service Details</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
            <span>Container Type</span>
            <select
              value={containerType}
              onChange={(e) => setContainerType(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 text-sm text-body bg-white"
            >
              <option value="">None / Unspecified</option>
              <option value="STEEL">Steel</option>
              <option value="DISPOSABLE">Disposable</option>
            </select>
          </div>

          <div className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
            <span>Spice Level</span>
            <select
              value={spiceLevel}
              onChange={(e) => setSpiceLevel(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 text-sm text-body bg-white"
            >
              <option value="">None / Unspecified</option>
              <option value="MILD">Mild</option>
              <option value="MEDIUM">Medium / Normal</option>
              <option value="SPICY">Spicy</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
          <span>Tiffin Wash Required?</span>
          <select
            value={requiresTiffinWash}
            onChange={(e) => setRequiresTiffinWash(e.target.value)}
            className="w-full rounded-xl border border-slate-200 p-2 text-sm text-body bg-white"
          >
            <option value="">Unspecified</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        <Input
          label="Delivery Areas (comma-separated)"
          name="deliveryAreasInput"
          value={deliveryAreasInput}
          onChange={(e) => setDeliveryAreasInput(e.target.value)}
          placeholder="e.g. Kothrud, Karve Nagar, Deccan"
        />
      </div>

      {/* 4. Notes */}
      <div className="space-y-3 border-t pt-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">4. Internal Notes</h3>
        <Textarea label="Submitter Note" name="submitterNote" value={submitterNote} onChange={(e) => setSubmitterNote(e.target.value)} />
        <Textarea label="Admin Note" name="adminNote" value={adminNote} onChange={(e) => setAdminNote(e.target.value)} />
      </div>

      {/* 5. Offerings & Pricing */}
      <div className="space-y-3 border-t pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">5. Offerings & Pricing</h3>
          <button
            type="button"
            onClick={addOffering}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#6aa337] hover:underline cursor-pointer"
          >
            <Plus size={14} /> Add Size
          </button>
        </div>

        {offerings.map((off, idx) => (
          <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-2.5 relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Offering #{idx + 1}</span>
              {offerings.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeOffering(idx)}
                  className="text-xs text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={12} /> Remove
                </button>
              )}
            </div>

            <Input
              label="Size Name (e.g. Standard / Mini / Executive)"
              name={`offering_${idx}_sizeName`}
              value={off.sizeName}
              onChange={(e) => updateOffering(idx, 'sizeName', e.target.value)}
            />

            <Input
              label="Components (comma-separated e.g. 4 Roti, Sabzi, Rice)"
              name={`offering_${idx}_componentsText`}
              value={off.componentsText}
              onChange={(e) => updateOffering(idx, 'componentsText', e.target.value)}
            />

            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Price / Meal (₹)"
                name={`offering_${idx}_pricePerMeal`}
                type="number"
                value={off.pricePerMeal}
                onChange={(e) => updateOffering(idx, 'pricePerMeal', e.target.value)}
              />
              <Input
                label="Price / Month (₹)"
                name={`offering_${idx}_pricePerMonth`}
                type="number"
                value={off.pricePerMonth}
                onChange={(e) => updateOffering(idx, 'pricePerMonth', e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-3 border-t pt-4">
        <Button variant="primary" onClick={handleSave} disabled={saving} className="flex-1">
          {saving ? 'Saving All Fields…' : 'Save All Changes'}
        </Button>
        <Button variant="ghost" onClick={() => setOpen(false)} disabled={saving}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
