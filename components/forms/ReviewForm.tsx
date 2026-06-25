'use client';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ReviewSchema, type ReviewInput } from '@/lib/validations';
import { StarRatingInteractive } from '@/components/ui/StarRating';
import { Textarea } from '@/components/ui/Textarea';
import { ImageUploader } from '@/components/forms/ImageUploader';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ReviewFormProps {
  serviceId: string;
  slug: string;
}

export function ReviewForm({ serviceId, slug }: ReviewFormProps) {
  const router = useRouter();
  const [uploadedKeys, setUploadedKeys] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<ReviewInput>({
    resolver: zodResolver(ReviewSchema),
    defaultValues: { serviceId, rating: 0, body: '', r2Keys: [] },
  });

  const onSubmit = async (values: ReviewInput) => {
    setSubmitError(null);
    const payload = { ...values, r2Keys: uploadedKeys };
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.status === 201) {
      router.push(`/tiffin/${slug}?reviewed=1`);
      return;
    }
    if (res.status === 409) {
      router.push(`/tiffin/${slug}?alreadyReviewed=1`);
      return;
    }
    const data = await res.json().catch(() => ({}));
    setSubmitError(
      typeof data.error === 'string' ? data.error : 'Something went wrong. Please try again.',
    );
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      {/* Star Rating — interactive mode. The control self-labels via
          role="radiogroup"; the visible <label> below is for sighted users. */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-body" id="rating-label">
          Your rating <span aria-hidden="true">*</span>
        </label>
        <StarRatingInteractive
          rating={form.watch('rating')}
          onChange={(val) => form.setValue('rating', val, { shouldValidate: true })}
          size="lg"
        />
        {form.formState.errors.rating && (
          <p role="alert" className="mt-1 text-sm text-red-600">
            {form.formState.errors.rating.message}
          </p>
        )}
      </div>

      {/* Review body — optional, min 10 chars if provided. The styled <Textarea>
          is NOT forwardRef, so it is wrapped in <Controller> (drop `ref`, spread
          the rest) — same convention as AddListingForm. */}
      <div className="mb-6">
        <Controller
          name="body"
          control={form.control}
          render={({ field: { ref, ...field }, fieldState }) => (
            <Textarea
              label="Your review (optional)"
              maxLength={800}
              {...field}
              value={field.value ?? ''}
              error={fieldState.error?.message}
            />
          )}
        />
      </div>

      {/* Images — optional, max 3 files, max 3MB each */}
      <div className="mb-6">
        <ImageUploader
          label="Photos (optional, max 3)"
          maxFiles={3}
          maxSizeMB={3}
          context="review"
          onUploadComplete={setUploadedKeys}
        />
      </div>

      {submitError && (
        <p role="alert" className="mb-4 text-sm text-red-600">
          {submitError}
        </p>
      )}

      <Button type="submit" variant="primary" size="lg" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Submitting...' : 'Submit review'}
      </Button>
    </form>
  );
}
