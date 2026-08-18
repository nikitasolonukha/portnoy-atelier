import { z } from "zod";

const appModeSchema = z.enum(["demo", "supabase"]);

const emptyToUndefined = (value: unknown) => value === "" ? undefined : value;
const optionalUrl = z.preprocess(emptyToUndefined, z.string().url().optional());
const optionalAnonKey = z.preprocess(emptyToUndefined, z.string().min(12).optional());

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_MODE: appModeSchema,
  NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalAnonKey,
  APP_VERSION: z.string().default("dev"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
}).superRefine((value, context) => {
  if (value.APP_MODE === "supabase") {
    if (!value.NEXT_PUBLIC_SUPABASE_URL) context.addIssue({ code: "custom", path: ["NEXT_PUBLIC_SUPABASE_URL"], message: "SUPABASE URL обязателен в режиме supabase" });
    if (!value.NEXT_PUBLIC_SUPABASE_ANON_KEY) context.addIssue({ code: "custom", path: ["NEXT_PUBLIC_SUPABASE_ANON_KEY"], message: "SUPABASE ANON KEY обязателен в режиме supabase" });
  }
});

const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_MODE: appModeSchema,
  NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalAnonKey,
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type PublicEnv = z.infer<typeof publicEnvSchema>;

export function parseServerEnv(source: Record<string, string | undefined>): ServerEnv {
  return serverEnvSchema.parse(source);
}

export function parsePublicEnv(source: Record<string, string | undefined>): PublicEnv {
  return publicEnvSchema.parse(source);
}

export function getServerEnv(): ServerEnv {
  return parseServerEnv({
    NODE_ENV: process.env.NODE_ENV,
    APP_MODE: process.env.APP_MODE,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    APP_VERSION: process.env.APP_VERSION,
    LOG_LEVEL: process.env.LOG_LEVEL,
  });
}
