import { z } from 'zod';

export const credentialsSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
});

export type Credentials = z.infer<typeof credentialsSchema>;
