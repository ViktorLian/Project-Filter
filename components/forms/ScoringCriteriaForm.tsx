'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface Question {
  id: string;
  label: string;
  type: string;
}

interface Form {
  id: string;
  name: string;
  scoring_criteria: any;
  questions: Question[];
}

interface Criteria {
  type: 'exact' | 'contains' | 'range' | 'greater' | 'less';
  value?: string | number;
  min?: number;
  max?: number;
  points: number;
}

export default function ScoringCriteriaForm({ form }: { form: Form }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [criteria, setCriteria] = useState<Record<string, Criteria>>(
    form.scoring_criteria || {}
  );

  const updateCriteria = (questionId: string, field: string, value: any) => {
    setCriteria((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [field]: value,
      },
    }));
  };

  const removeCriteria = (questionId: string) => {
    setCriteria((prev) => {
      const updated = { ...prev };
      delete updated[questionId];
      return updated;
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/forms/${form.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scoring_criteria: criteria }),
      });

      if (!res.ok) throw new Error('Failed to save');

      router.refresh();
      alert('Scoring-kriterier lagret!');
    } catch (e) {
      alert('Feil ved lagring');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {form.questions.map((question) => {
        const criterion = criteria[question.id];
        const isActive = !!criterion;

        return (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle className="text-lg">{question.label}</CardTitle>
              <CardDescription>Type: {question.type}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isActive ? (
                <Button
                  onClick={() =>
                    updateCriteria(question.id, 'type', 'contains')
                  }
                  variant="outline"
                  className="w-full"
                >
                  + Legg til scoring-regel
                </Button>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Regel-type</Label>
                      <Select
                        value={criterion.type}
                        onValueChange={(value) =>
                          updateCriteria(question.id, 'type', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="exact">Eksakt match</SelectItem>
                          <SelectItem value="contains">Inneholder tekst</SelectItem>
                          <SelectItem value="range">Tallområde</SelectItem>
                          <SelectItem value="greater">Større enn</SelectItem>
                          <SelectItem value="less">Mindre enn</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Poeng</Label>
                      <Input
                        type="number"
                        value={criterion.points || 0}
                        onChange={(e) =>
                          updateCriteria(
                            question.id,
                            'points',
                            parseInt(e.target.value) || 0
                          )
                        }
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {criterion.type === 'range' ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label>Minimum verdi</Label>
                        <Input
                          type="number"
                          value={criterion.min || ''}
                          onChange={(e) =>
                            updateCriteria(
                              question.id,
                              'min',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label>Maksimum verdi</Label>
                        <Input
                          type="number"
                          value={criterion.max || ''}
                          onChange={(e) =>
                            updateCriteria(
                              question.id,
                              'max',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="100"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Label>
                        {criterion.type === 'exact'
                          ? 'Forventet svar'
                          : criterion.type === 'contains'
                          ? 'Tekst som må være med'
                          : 'Verdi'}
                      </Label>
                      <Input
                        type={
                          criterion.type === 'greater' ||
                          criterion.type === 'less'
                            ? 'number'
                            : 'text'
                        }
                        value={criterion.value || ''}
                        onChange={(e) =>
                          updateCriteria(question.id, 'value', e.target.value)
                        }
                        placeholder={
                          criterion.type === 'contains'
                            ? 'f.eks: ja, interessert'
                            : 'Verdi'
                        }
                      />
                    </div>
                  )}

                  <Button
                    onClick={() => removeCriteria(question.id)}
                    variant="destructive"
                    size="sm"
                  >
                    Fjern regel
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        );
      })}

      <div className="flex gap-3 pt-4">
        <Button onClick={handleSave} disabled={loading} className="w-full">
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Lagre kriterier
        </Button>
      </div>
    </div>
  );
}
