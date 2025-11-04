import z from 'zod/v4';

export const personSchema = z.object({
  name: z.string(),
  interests: z.array(z.string()),
  extras: z.string(),
});

export type Person = z.infer<typeof personSchema>;
