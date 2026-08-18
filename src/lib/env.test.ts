import { describe, expect, it } from "vitest";
import { parsePublicEnv, parseServerEnv } from "./env";

describe("environment contract", () => {
  it("allows explicit demo mode without Supabase credentials", () => {
    expect(parseServerEnv({ APP_MODE: "demo", NODE_ENV: "test" }).APP_MODE).toBe("demo");
  });

  it("treats empty optional build arguments as absent in demo mode", () => {
    const result = parseServerEnv({ APP_MODE: "demo", NODE_ENV: "production", NEXT_PUBLIC_SUPABASE_URL: "", NEXT_PUBLIC_SUPABASE_ANON_KEY: "" });
    expect(result.NEXT_PUBLIC_SUPABASE_URL).toBeUndefined();
    expect(result.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeUndefined();
  });

  it("fails fast when Supabase mode has no credentials", () => {
    expect(() => parseServerEnv({ APP_MODE: "supabase", NODE_ENV: "production" })).toThrow(/SUPABASE/);
  });

  it("accepts a complete Supabase environment", () => {
    const result = parseServerEnv({
      APP_MODE: "supabase",
      NODE_ENV: "production",
      NEXT_PUBLIC_SUPABASE_URL: "https://atelier.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key-long-enough",
    });
    expect(result.APP_MODE).toBe("supabase");
  });

  it("never silently converts an unknown public mode to demo", () => {
    expect(() => parsePublicEnv({ NEXT_PUBLIC_APP_MODE: "preview" })).toThrow();
  });
});
