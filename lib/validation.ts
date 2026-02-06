import { z } from 'zod';

export const createFormSchema = z.object({
  name: z.string().min(2, 'Form name must be at least 2 characters'),
  description: z.string().optional(),
});

export const createQuestionSchema = z.object({
  label: z.string().min(2),
  type: z.enum([
    'TEXT',
    'EMAIL',
    'PHONE',
    'DROPDOWN',
    'MULTIPLE_CHOICE',
    'NUMBER',
    'DATE',
    'FILE',
    'ADDRESS',
  ]),
  required: z.boolean().optional(),
  options: z.array(z.string()).optional(),
  weight: z.number().int().optional(),
  redFlagValues: z.array(z.string()).optional(),
});

export const publicLeadSubmissionSchema = z.object({
  formId: z.string().cuid(),
  answers: z.array(
    z.object({
      questionId: z.string().cuid(),
      value: z.string().max(5000),
    }),
  ),
  customerName: z.string().optional(),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
});
