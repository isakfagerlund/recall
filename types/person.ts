import z from 'zod/v4';

export const generatePersonSchema = z.object({
  name: z.string(),
  description: z.string(),
});

export const personSchema = z.object({
  id: z.uuidv4(),
  name: z.string(),
  description: z.string(),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
});

export type Person = z.infer<typeof personSchema>;
