import { createFileRoute } from "@tanstack/react-router";
import { OffersList } from "@/components/OffersList";

export const Route = createFileRoute("/_authenticated/crypto")({
  head: () => ({ meta: [{ title: "Crypto Clicks — SmartHELA" }, { name: "description", content: "Web3 quests, testnets and learning tasks, paid after verification." }] }),
  component: () => <OffersList section="crypto" title="Crypto clicks" intro="Web3 quests, testnets and learning tasks. Opening a link doesn't pay — finishing the task and getting verified does." />,
});
