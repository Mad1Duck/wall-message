import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  server: {},

  clientPrefix: 'VITE_',

  client: {
    VITE_CLERK_PUBLISHABLE_KEY: z.string().min(1),
    VITE_API_URL: z.string().url(),
    VITE_APP_TITLE: z.string().min(1).optional(),
    VITE_OWNER_PASSWORD: z.string().min(1).optional(),
  },

  runtimeEnv: import.meta.env,
  emptyStringAsUndefined: true,
});
