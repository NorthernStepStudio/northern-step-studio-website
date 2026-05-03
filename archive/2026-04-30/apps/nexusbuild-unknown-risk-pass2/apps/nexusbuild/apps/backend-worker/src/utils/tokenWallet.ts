import type { SupabaseClient } from "@supabase/supabase-js";
import { isMissingColumnError } from "./serializers";

export type TokenStorageMode = "user_token_balances" | "users.tokens" | "missing";

export type TokenBalanceResult = {
  ok: boolean;
  balance: number;
  storage: TokenStorageMode;
  error?: string;
};

const TOKEN_BALANCE_TABLE = "user_token_balances";
const USER_TABLE = "users";

const toInt = (value: unknown): number => {
  if (typeof value === "number") return Math.floor(value);
  if (!value) return 0;
  const s = String(value).toLowerCase().trim();
  if (s.endsWith("k")) return Math.round(parseFloat(s) * 1000);
  if (s.endsWith("m")) return Math.round(parseFloat(s) * 1000000);
  const parsed = Number.parseInt(s.replace(/[^0-9.-]/g, ""), 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeUserId = (value: unknown): number | null => {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) ? parsed : null;
};

const isMissingTableError = (error: any): boolean => {
  const message = String(error?.message || "");
  const code = String(error?.code || "");
  return (
    code === "PGRST205" ||
    /relation .+ does not exist/i.test(message) ||
    /could not find.+table/i.test(message)
  );
};

const resolveStorageMode = async (
  supabase: SupabaseClient,
): Promise<TokenStorageMode> => {
  const walletProbe = await supabase
    .from(TOKEN_BALANCE_TABLE)
    .select("balance")
    .limit(1);

  if (!walletProbe.error) {
    return "user_token_balances";
  }

  if (!isMissingTableError(walletProbe.error)) {
    return "missing";
  }

  const usersProbe = await supabase.from(USER_TABLE).select("tokens").limit(1);
  if (!usersProbe.error) {
    return "users.tokens";
  }

  if (isMissingColumnError(usersProbe.error) || isMissingTableError(usersProbe.error)) {
    return "missing";
  }

  return "missing";
};

const readFromWalletTable = async (
  supabase: SupabaseClient,
  userId: number,
): Promise<TokenBalanceResult> => {
  const { data, error } = await supabase
    .from(TOKEN_BALANCE_TABLE)
    .select("balance")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      balance: 0,
      storage: "user_token_balances",
      error: error.message,
    };
  }

  if (!data) {
    return { ok: true, balance: 0, storage: "user_token_balances" };
  }

  return {
    ok: true,
    balance: toInt((data as Record<string, unknown>).balance),
    storage: "user_token_balances",
  };
};

const readFromUsersTable = async (
  supabase: SupabaseClient,
  userId: number,
): Promise<TokenBalanceResult> => {
  const { data, error } = await supabase
    .from(USER_TABLE)
    .select("tokens")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      balance: 0,
      storage: "users.tokens",
      error: error.message,
    };
  }

  if (!data) {
    return {
      ok: false,
      balance: 0,
      storage: "users.tokens",
      error: "User not found.",
    };
  }

  return {
    ok: true,
    balance: toInt((data as Record<string, unknown>).tokens),
    storage: "users.tokens",
  };
};

const writeToWalletTable = async (
  supabase: SupabaseClient,
  userId: number,
  balance: number,
): Promise<TokenBalanceResult> => {
  const existing = await supabase
    .from(TOKEN_BALANCE_TABLE)
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing.error) {
    return {
      ok: false,
      balance: 0,
      storage: "user_token_balances",
      error: existing.error.message,
    };
  }

  const payload = {
    user_id: userId,
    balance,
    updated_at: new Date().toISOString(),
  };

  if (existing.data) {
    const updated = await supabase
      .from(TOKEN_BALANCE_TABLE)
      .update(payload)
      .eq("user_id", userId);

    if (updated.error) {
      return {
        ok: false,
        balance: 0,
        storage: "user_token_balances",
        error: updated.error.message,
      };
    }

    return { ok: true, balance, storage: "user_token_balances" };
  }

  const inserted = await supabase.from(TOKEN_BALANCE_TABLE).insert({
    user_id: userId,
    balance,
  });
  if (inserted.error) {
    return {
      ok: false,
      balance: 0,
      storage: "user_token_balances",
      error: inserted.error.message,
    };
  }

  return { ok: true, balance, storage: "user_token_balances" };
};

const writeToUsersTable = async (
  supabase: SupabaseClient,
  userId: number,
  balance: number,
): Promise<TokenBalanceResult> => {
  const updated = await supabase
    .from(USER_TABLE)
    .update({ tokens: balance })
    .eq("id", userId);

  if (updated.error) {
    return {
      ok: false,
      balance: 0,
      storage: "users.tokens",
      error: updated.error.message,
    };
  }

  return { ok: true, balance, storage: "users.tokens" };
};

export const getTokenBalance = async (
  supabase: SupabaseClient,
  userIdValue: unknown,
): Promise<TokenBalanceResult> => {
  const userId = normalizeUserId(userIdValue);
  if (!userId) {
    return {
      ok: false,
      balance: 0,
      storage: "missing",
      error: "Invalid user id.",
    };
  }

  const storage = await resolveStorageMode(supabase);
  if (storage === "user_token_balances") {
    return readFromWalletTable(supabase, userId);
  }
  if (storage === "users.tokens") {
    return readFromUsersTable(supabase, userId);
  }

  return {
    ok: false,
    balance: 0,
    storage: "missing",
    error:
      "No token storage found. Create public.user_token_balances or add users.tokens.",
  };
};

export const adjustTokenBalance = async (
  supabase: SupabaseClient,
  userIdValue: unknown,
  delta: number,
): Promise<TokenBalanceResult> => {
  const current = await getTokenBalance(supabase, userIdValue);
  if (!current.ok) {
    return current;
  }

  const userId = normalizeUserId(userIdValue);
  if (!userId) {
    return {
      ok: false,
      balance: 0,
      storage: "missing",
      error: "Invalid user id.",
    };
  }

  const nextBalance = Math.max(0, current.balance + toInt(delta));

  if (current.storage === "user_token_balances") {
    return writeToWalletTable(supabase, userId, nextBalance);
  }
  if (current.storage === "users.tokens") {
    return writeToUsersTable(supabase, userId, nextBalance);
  }

  return {
    ok: false,
    balance: 0,
    storage: "missing",
    error:
      "No token storage found. Create public.user_token_balances or add users.tokens.",
  };
};

export const getTokenStorageStatus = async (supabase: SupabaseClient) => {
  const storage = await resolveStorageMode(supabase);
  return {
    storage,
    configured: storage !== "missing",
  };
};
