import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, ListChecks, Briefcase, Wallet, Gift, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SmartHELA — Legit ways to earn online in Africa" },
      { name: "description", content: "Complete verified tasks, surveys and freelance gigs, earn rewards and withdraw to M-Pesa." },
      { property: "og:title", content: "SmartHELA — Legit ways to earn online" },
      { property: "og:description", content: "Verified tasks, freelance work, deals and a transparent wallet." },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: ListChecks, title: "Verified tasks", body: "Real tasks from real brands. Every reward is reviewed and recorded." },
  { icon: Briefcase, title: "Freelance work", body: "Find gigs that match your skills and get paid on delivery." },
  { icon: Wallet, title: "Transparent wallet", body: "See pending, available and withdrawn money — every shilling traced." },
  { icon: Gift, title: "Rewards & streaks", body: "Daily check-ins, levels and badges for consistent earners." },
  { icon: Users, title: "Genuine referrals", body: "Earn when friends you invite become active — not for empty signups." },
  { icon: ShieldCheck, title: "Fraud protected", body: "No pay-to-join, no fake promises. Built to stay trustworthy." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Logo />
        <Button asChild variant="ghost"><Link to="/auth">Sign in</Link></Button>
      </header>
      <section className="mx-auto max-w-5xl px-4 pb-12 pt-8 text-center md:pt-16">
        <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">Built for Africa · Withdraw to M-Pesa</span>
        <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold leading-tight md:text-6xl">
          Earn online the <span className="text-brand">honest way</span>.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground md:text-lg">
          Tasks, surveys, freelance gigs and deals in one place — with a wallet you can actually trust.
        </p>
        <div className="mt-7 flex justify-center gap-3">
          <Button asChild size="lg" className="bg-brand shadow-soft rounded-full px-7"><Link to="/auth">Start earning</Link></Button>
          <Button asChild size="lg" variant="outline" className="rounded-full"><Link to="/auth">I'm hiring</Link></Button>
        </div>
      </section>
      <section className="mx-auto grid max-w-5xl gap-4 px-4 pb-16 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-3 inline-flex rounded-xl bg-accent p-2.5 text-accent-foreground"><f.icon className="h-5 w-5" /></div>
            <h3 className="font-bold">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
          </div>
        ))}
      </section>
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">© SmartHELA. Earnings depend on available tasks — no guaranteed income.</footer>
    </div>
  );
}
