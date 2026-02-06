'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Question = {
  id: string;
  question_text: string;
  question_type: string;
  required: boolean;
  options: string[] | null;
};

export default function PublicFormClient({
  formId,
  questions,
}: {
  formId: string;
  questions: Question[];
}) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setAnswer(questionId: string, value: any) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validate required fields
    for (const q of questions) {
      if (q.required && !answers[q.id]) {
        setError(`Please answer: ${q.question_text}`);
        setLoading(false);
        return;
      }
    }

    try {
      const res = await fetch(`/api/forms/${formId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit form');
      }

      setSubmitted(true);
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Thank you!
        </h2>
        <p className="text-slate-600">
          We've received your submission and will get back to you soon.
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

      {questions.map((q) => (
        <div key={q.id} className="space-y-2">
          <Label>
            {q.question_text}
            {q.required && <span className="text-red-500 ml-1">*</span>}
          </Label>

          {q.question_type === 'text' && (
            <Input
              value={answers[q.id] || ''}
              onChange={(e) => setAnswer(q.id, e.target.value)}
              required={q.required}
            />
          )}

          {q.question_type === 'textarea' && (
            <Textarea
              value={answers[q.id] || ''}
              onChange={(e) => setAnswer(q.id, e.target.value)}
              rows={4}
              required={q.required}
            />
          )}

          {q.question_type === 'number' && (
            <Input
              type="number"
              value={answers[q.id] || ''}
              onChange={(e) => setAnswer(q.id, e.target.value)}
              required={q.required}
            />
          )}

          {q.question_type === 'select' && q.options && (
            <Select
              value={answers[q.id] || ''}
              onValueChange={(value) => setAnswer(q.id, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an option..." />
              </SelectTrigger>
              <SelectContent>
                {q.options.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {q.question_type === 'radio' && q.options && (
            <div className="space-y-2">
              {q.options.map((opt) => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={q.id}
                    value={opt}
                    checked={answers[q.id] === opt}
                    onChange={(e) => setAnswer(q.id, e.target.value)}
                    required={q.required}
                    className="rounded-full border-gray-300"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          )}

          {q.question_type === 'checkbox' && q.options && (
            <div className="space-y-2">
              {q.options.map((opt) => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(answers[q.id] || []).includes(opt)}
                    onChange={(e) => {
                      const current = answers[q.id] || [];
                      if (e.target.checked) {
                        setAnswer(q.id, [...current, opt]);
                      } else {
                        setAnswer(q.id, current.filter((v: string) => v !== opt));
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      ))}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Submitting...' : 'Submit'}
      </Button>
    </form>
  );
}
