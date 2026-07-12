'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/providers/ToastProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

interface AdminEditFormProps {
  listingId: string;
  initial: {
    name: string;
    city: string;
    area: string;
    whatsappNumber: string;
    description: string;
  };
}

export function AdminEditForm({ listingId, initial }: AdminEditFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);

  function update<K extends keyof typeof values>(key: K, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    // Send only fields the admin actually changed (AdminEditSchema is .partial()).
    const patch: Record<string, string> = {};
    (Object.keys(values) as (keyof typeof values)[]).forEach((k) => {
      if (values[k] !== initial[k]) patch[k] = values[k];
    });

    if (Object.keys(patch).length === 0) {
      showToast('No changes to save.', 'error');
      setSaving(false);
      return;
    }

    const res = await fetch(`/api/listings/${listingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    setSaving(false);

    if (res.ok) {
      showToast('Changes saved.', 'success');
      setOpen(false);
      router.refresh(); // re-render the server page with updated values
    } else {
      showToast('Could not save changes. Check the fields and try again.', 'error');
    }
  }

  if (!open) {
    return (
      <div>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Edit fields
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-black/5 bg-white p-6 shadow-[var(--shadow-soft)]">
      <h2 className="font-semibold text-body">Edit listing</h2>
      <Input
        label="Name"
        name="name"
        value={values.name}
        onChange={(e) => update('name', e.target.value)}
      />
      <Input
        label="City"
        name="city"
        value={values.city}
        onChange={(e) => update('city', e.target.value)}
      />
      <Input
        label="Area"
        name="area"
        value={values.area}
        onChange={(e) => update('area', e.target.value)}
      />
      <Input
        label="WhatsApp number"
        name="whatsappNumber"
        value={values.whatsappNumber}
        onChange={(e) => update('whatsappNumber', e.target.value)}
      />
      <Textarea
        label="Description"
        name="description"
        value={values.description}
        maxLength={800}
        onChange={(e) => update('description', e.target.value)}
      />
      <div className="flex gap-3">
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
        <Button variant="ghost" onClick={() => setOpen(false)} disabled={saving}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
