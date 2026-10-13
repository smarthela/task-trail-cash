import { createFileRoute } from "@tanstack/react-router";
import { OffersList } from "@/components/OffersList";

export const Route = createFileRoute("/_authenticated/offers")({
  head: () => ({ meta: [{ title: "Earning Links — SmartHELA" }, { name: "description", content: "Affiliate, app referral, banking and promo offers that pay after verification." }] }),
  component: () => <OffersList section="earn" title="Earning links" intro="Affiliate, app referral, banking and promo offers. You're paid after your completion is verified." />,
});
