'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Define types locally since we removed Prisma
type QuestionType = 'TEXT' | 'EMAIL' | 'PHONE' | 'ADDRESS' | 'NUMBER' | 'DATE' | 'DROPDOWN' | 'MULTIPLE_CHOICE' | 'FILE' | 'TEXTAREA';

type Question = {
  id: string;
  label: string;
  type: QuestionType;
  required: boolean;
  options: string[];
  order: number;
};

const QuestionType = {
  TEXT: 'TEXT' as const,
  EMAIL: 'EMAIL' as const,
  PHONE: 'PHONE' as const,
  ADDRESS: 'ADDRESS' as const,
  NUMBER: 'NUMBER' as const,
  DATE: 'DATE' as const,
  DROPDOWN: 'DROPDOWN' as const,
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE' as const,
  FILE: 'FILE' as const,
  TEXTAREA: 'TEXTAREA' as const,
};

export default function FormRenderer({
  formId,
  questions,
}: {
  formId: string;
  questions: Question[];
}) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const answers = questions.map((q) => ({
      questionId: q.id,
      value: String(formData.get(q.id) ?? ''),
    }));

    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        formId,
        answers,
        customerName: formData.get('customerName'),
        customerEmail: formData.get('customerEmail'),
        customerPhone: formData.get('customerPhone'),
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Failed to submit');
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-6 text-center space-y-3">
        <div className="text-4xl">✅</div>
        <h2 className="text-xl font-semibold text-emerald-900">
          Thank You!
        </h2>
        <p className="text-emerald-800">
          Your project inquiry has been received. We&apos;ll review it and get
          back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-sm p-3 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="customerName">Name</Label>
          <Input id="customerName" name="customerName" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customerEmail">Email</Label>
          <Input
            id="customerEmail"
            name="customerEmail"
            type="email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customerPhone">Phone</Label>
          <Input id="customerPhone" name="customerPhone" />
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((q) => (
          <div key={q.id} className="space-y-2">
            <Label htmlFor={q.id}>
              {q.label}
              {q.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {renderField(q)}
          </div>
        ))}
      </div>

      <Button type="submit" disabled={submitting} size="lg" className="w-full">
        {submitting ? 'Submitting...' : 'Submit Project Inquiry'}
      </Button>
    </form>
  );
}

function renderField(q: Question) {
  const commonProps = {
    id: q.id,
    name: q.id,
    required: q.required,
  };

  switch (q.type) {
    case QuestionType.TEXT:
    case QuestionType.EMAIL:
    case QuestionType.PHONE:
    case QuestionType.ADDRESS:
      return <Input {...commonProps} type={q.type.toLowerCase()} />;

    case QuestionType.NUMBER:
      return <Input {...commonProps} type="number" />;

    case QuestionType.DATE:
      return <Input {...commonProps} type="date" />;

    case QuestionType.DROPDOWN:
      return (
        <select
          {...commonProps}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Select...</option>
          {q.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );

    case QuestionType.MULTIPLE_CHOICE:
      return (
        <div className="space-y-2">
          {q.options.map((opt) => (
            <label
              key={opt}
              className="flex items-center gap-2 text-sm cursor-pointer"
            >
              <input
                type="radio"
                name={q.id}
                value={opt}
                required={q.required}
                className="h-4 w-4"
              />
              {opt}
            </label>
          ))}
        </div>
      );

    case QuestionType.FILE:
      return (
        <Input
          {...commonProps}
          type="file"
          required={false}
          className="cursor-pointer"
        />
      );

    default:
      return <Textarea {...commonProps} rows={3} />;
  }
}
