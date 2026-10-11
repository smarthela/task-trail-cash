import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock } from "lucide-react";
import { features } from "@/lib/nav";
import { meQuery } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/explore/$slug")({
  loader: ({ params }) => {
    const f = features[params.slug];
    if (!f) throw notFound();
    return f;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title ?? "Feature"} — SmartHELA` },
      { name: "description", content: loaderData?.body ?? "" },
      { property: "og:title", content: `${loaderData?.title ?? "Feature"} — SmartHELA` },
      { property: "og:description", content: loaderData?.body ?? "" },
    ],
  }),
  notFoundComponent: () => <p className="py-10 text-center text-muted-foreground">This section doesn't exist.</p>,
  component: FeaturePage,
});

function FeaturePage() {
  const f = Route.useLoaderData();
  const { data: me } = useQuery(meQuery);
  if (f.admin && me && !me.isAdmin) return <p className="py-10 text-center text-muted-foreground">You don't have access to this section.</p>;
  return (
    <div className="mx-auto max-w-xl py-6">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
          <Clock className="h-3.5 w-3.5" /> Coming soon
        </span>
        <h1 className="mt-4 text-2xl font-bold">{f.title}</h1>
        <p className="mt-2 text-muted-foreground">{f.body}</p>
        <p className="mt-4 text-sm text-muted-foreground">This section isn't live yet — nothing here is active or paying out. We'll notify you when it opens.</p>
        <div className="mt-6 flex gap-2">
          <Link to="/tasks" className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Browse tasks</Link>
          <Link to="/dashboard" className="rounded-full border border-border px-4 py-2 text-sm font-semibold">Back to home</Link>
        </div>
      </div>
    </div>
  );
}
