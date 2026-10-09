import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const kes = (n: number | null | undefined) =>
  "KES " + Number(n ?? 0).toLocaleString("en-KE", { maximumFractionDigits: 2 });

async function uid() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Not signed in");
  return data.user.id;
}

const must = <T,>(r: { data: T; error: { message: string } | null }) => {
  if (r.error) throw new Error(r.error.message);
  return r.data as NonNullable<T>;
};

export const meQuery = queryOptions({
  queryKey: ["me"],
  queryFn: async () => {
    const id = await uid();
    const [profile, wallet, roles] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", id).maybeSingle(),
      supabase.from("wallets").select("*").eq("user_id", id).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", id),
    ]);
    const r = (must(roles) ?? []).map((x) => x.role);
    return {
      id,
      profile: must(profile),
      wallet: must(wallet),
      roles: r,
      isAdmin: r.includes("admin") || r.includes("super_admin"),
    };
  },
});

export const tasksQuery = queryOptions({
  queryKey: ["tasks"],
  queryFn: async () =>
    must(await supabase.from("tasks").select("*").eq("status", "active").order("created_at", { ascending: false })),
});

export const taskQuery = (id: string) =>
  queryOptions({
    queryKey: ["task", id],
    queryFn: async () => must(await supabase.from("tasks").select("*").eq("id", id).maybeSingle()),
  });

export const mySubmissionsQuery = queryOptions({
  queryKey: ["my-submissions"],
  queryFn: async () => {
    const id = await uid();
    return must(
      await supabase.from("task_submissions").select("*, tasks(title)").eq("user_id", id).order("created_at", { ascending: false }),
    );
  },
});

export const txnsQuery = queryOptions({
  queryKey: ["txns"],
  queryFn: async () => {
    const id = await uid();
    return must(
      await supabase.from("wallet_transactions").select("*").eq("user_id", id).order("created_at", { ascending: false }).limit(50),
    );
  },
});

export const withdrawalsQuery = queryOptions({
  queryKey: ["withdrawals"],
  queryFn: async () => {
    const id = await uid();
    return must(await supabase.from("withdrawal_requests").select("*").eq("user_id", id).order("created_at", { ascending: false }));
  },
});

export const dealsQuery = queryOptions({
  queryKey: ["deals"],
  queryFn: async () => must(await supabase.from("deals").select("*").eq("active", true).order("created_at", { ascending: false })),
});

export const referralsQuery = queryOptions({
  queryKey: ["referrals"],
  queryFn: async () => {
    const id = await uid();
    return must(await supabase.from("referrals").select("*").eq("referrer_id", id).order("created_at", { ascending: false }));
  },
});

export const notificationsQuery = queryOptions({
  queryKey: ["notifications"],
  queryFn: async () => {
    const id = await uid();
    return must(await supabase.from("notifications").select("*").eq("user_id", id).order("created_at", { ascending: false }).limit(50));
  },
});
