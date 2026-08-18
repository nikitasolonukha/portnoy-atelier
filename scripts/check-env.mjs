import { z } from "zod";

const mode = z.enum(["demo", "supabase"]).parse(process.env.APP_MODE);
const publicMode = z.enum(["demo", "supabase"]).parse(process.env.NEXT_PUBLIC_APP_MODE);
if (mode !== publicMode) throw new Error("APP_MODE и NEXT_PUBLIC_APP_MODE должны совпадать");
if (mode === "supabase") {
  z.string().url().parse(process.env.NEXT_PUBLIC_SUPABASE_URL);
  z.string().min(12).parse(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
console.log(`Environment OK: ${mode}`);
