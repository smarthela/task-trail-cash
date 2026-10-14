import type { LucideIcon } from "lucide-react";
import {
  Home, Wallet, ListChecks, ClipboardList, Megaphone, Briefcase, Gift, Dices, Flame, Users, Trophy,
  Tag, ShoppingBag, Sparkles, Link2, History, FileCheck, Send, BarChart3, Receipt, ArrowUpRight,
  Bookmark, Bell, User, GraduationCap, CreditCard, Settings, LifeBuoy, FileText, LayoutDashboard,
  PlusCircle, PiggyBank, Handshake, Shield, UserCog, ListTodo, CheckSquare, ClipboardCheck, BadgeCheck,
  Banknote, ArrowLeftRight, Share2, Award, AlertTriangle, SlidersHorizontal,
} from "lucide-react";

/** A nav item either links to a real route or to a feature info page (/explore/$slug). */
export type NavItem = {
  label: string;
  icon: LucideIcon;
  to?: "/dashboard" | "/wallet" | "/tasks" | "/deals" | "/referrals" | "/notifications" | "/profile" | "/admin" | "/rewards" | "/crypto" | "/offers" | "/payment-methods";
  slug?: string;
  badge?: "notifications";
};
export type NavGroup = { title: string; items: NavItem[]; access?: "business" | "admin" };

export const navGroups: NavGroup[] = [
  { title: "Main", items: [
    { label: "Overview", icon: Home, to: "/dashboard" },
    { label: "My Wallet", icon: Wallet, to: "/wallet" },
    { label: "Earn Tasks", icon: ListChecks, to: "/tasks" },
    { label: "Surveys & Research", icon: ClipboardList, slug: "surveys" },
    { label: "Campaigns", icon: Megaphone, slug: "campaigns" },
    { label: "Freelance & Gigs", icon: Briefcase, slug: "freelance" },
  ]},
  { title: "Earn more", items: [
    { label: "Daily Rewards", icon: Gift, to: "/rewards" },
    { label: "Spin & Win", icon: Dices, slug: "spin" },
    { label: "Challenges & Streaks", icon: Flame, to: "/rewards" },
    { label: "Refer & Earn", icon: Users, to: "/referrals" },
    { label: "Leaderboard & Levels", icon: Trophy, to: "/rewards" },
  ]},
  { title: "Discover", items: [
    { label: "Deals & Offers", icon: Tag, to: "/deals" },
    { label: "Crypto Clicks", icon: Sparkles, to: "/crypto" },
    { label: "Digital Marketplace", icon: ShoppingBag, slug: "marketplace" },
    { label: "Creator Opportunities", icon: Sparkles, slug: "creators" },
    { label: "Affiliate Opportunities", icon: Link2, to: "/offers" },
  ]},
  { title: "My activity", items: [
    { label: "My Tasks", icon: History, to: "/tasks" },
    { label: "My Submissions", icon: FileCheck, to: "/tasks" },
    { label: "My Applications", icon: Send, slug: "applications" },
    { label: "My Campaigns", icon: BarChart3, slug: "my-campaigns" },
    { label: "Earnings History", icon: Receipt, to: "/wallet" },
    { label: "Withdrawal History", icon: ArrowUpRight, to: "/wallet" },
    { label: "Saved Opportunities", icon: Bookmark, slug: "saved" },
  ]},
  { title: "Account", items: [
    { label: "Notifications", icon: Bell, to: "/notifications", badge: "notifications" },
    { label: "My Profile", icon: User, to: "/profile" },
    { label: "Skills & Portfolio", icon: GraduationCap, to: "/profile" },
    { label: "Payment Methods", icon: CreditCard, to: "/payment-methods" },
    { label: "Settings", icon: Settings, to: "/profile" },
    { label: "Help & Support", icon: LifeBuoy, slug: "help" },
    { label: "Terms & Privacy", icon: FileText, slug: "terms" },
  ]},
  { title: "Business tools", access: "business", items: [
    { label: "Advertiser Dashboard", icon: LayoutDashboard, slug: "advertiser" },
    { label: "Create Campaign", icon: PlusCircle, slug: "create-campaign" },
    { label: "Campaign Analytics", icon: BarChart3, slug: "campaign-analytics" },
    { label: "Manage Campaign Budget", icon: PiggyBank, slug: "campaign-budget" },
    { label: "Client Dashboard", icon: Handshake, slug: "client-dashboard" },
  ]},
  { title: "Administration", access: "admin", items: [
    { label: "Admin Dashboard", icon: Shield, to: "/admin" },
    { label: "User Management", icon: UserCog, to: "/admin" },
    { label: "Task Management", icon: ListTodo, to: "/admin" },
    { label: "Submission Reviews", icon: CheckSquare, to: "/admin" },
    { label: "Survey Management", icon: ClipboardCheck, slug: "admin-surveys" },
    { label: "Campaign Approvals", icon: BadgeCheck, to: "/admin" },
    { label: "Withdrawal Requests", icon: Banknote, to: "/admin" },
    { label: "Wallet Transactions", icon: ArrowLeftRight, to: "/admin" },
    { label: "Referral Management", icon: Share2, slug: "admin-referrals" },
    { label: "Rewards Configuration", icon: Award, to: "/admin" },
    { label: "Fraud & Risk Review", icon: AlertTriangle, slug: "admin-fraud" },
    { label: "Reports & Settings", icon: SlidersHorizontal, to: "/admin" },
  ]},
];

export const features: Record<string, { title: string; body: string; admin?: boolean }> = {
  surveys: { title: "Surveys & Research", body: "Paid surveys with eligibility checks and duplicate-response protection. Surveys appear here as sponsors publish them." },
  campaigns: { title: "Campaigns", body: "Join funded brand, research and creator campaigns. Rewards come from each campaign's prepaid budget after verification." },
  freelance: { title: "Freelance & Gigs", body: "Find jobs in writing, design, coding and more, apply, and get paid per milestone." },
  "daily-rewards": { title: "Daily Rewards", body: "Check in daily to build a streak. The check-in reward amount is set by the platform team." },
  spin: { title: "Spin & Win", body: "Spin & Win is switched off until legal and compliance review is complete. Odds will always be published openly." },
  challenges: { title: "Challenges & Streaks", body: "Complete goals like 5 tasks or 3 surveys to earn bonuses and XP." },
  levels: { title: "Leaderboard & Levels", body: "Climb from Bronze to Platinum by earning XP from genuine, verified activity." },
  marketplace: { title: "Digital Marketplace", body: "Buy and sell templates, e-books, presets and other original digital products." },
  creators: { title: "Creator Opportunities", body: "Paid content briefs from brands looking for creators." },
  affiliates: { title: "Affiliate Opportunities", body: "Earn commission by recommending partner products, tracked transparently." },
  applications: { title: "My Applications", body: "Track freelance jobs you've applied for and their status." },
  "my-campaigns": { title: "My Campaigns", body: "Campaigns you've joined or created, with progress and rewards." },
  saved: { title: "Saved Opportunities", body: "Bookmark tasks, jobs and deals to come back to later." },
  "payment-methods": { title: "Payment Methods", body: "Save your M-Pesa number for faster withdrawals. For now, enter it on the Wallet page when withdrawing." },
  help: { title: "Help & Support", body: "Questions about tasks, payments or your account? Our support team is here to help." },
  terms: { title: "Terms & Privacy", body: "SmartHELA only pays for genuine, verified activity. Fake engagement, multiple accounts and vote manipulation are prohibited." },
  advertiser: { title: "Advertiser Dashboard", body: "Overview of your funded campaigns, spend and participation." },
  "create-campaign": { title: "Create Campaign", body: "Set up a campaign, fund its budget, and publish tasks once approved." },
  "campaign-analytics": { title: "Campaign Analytics", body: "Real participation and completion numbers for your campaigns." },
  "campaign-budget": { title: "Manage Campaign Budget", body: "See budget, allocated and remaining amounts for each campaign." },
  "client-dashboard": { title: "Client Dashboard", body: "Manage jobs you've posted, applicants, contracts and milestones." },
  "admin-surveys": { title: "Survey Management", body: "Create, target and close surveys.", admin: true },
  "admin-referrals": { title: "Referral Management", body: "Review referral activity and adjust referral rules.", admin: true },
  "admin-fraud": { title: "Fraud & Risk Review", body: "Review flagged accounts, duplicate submissions and suspicious withdrawals.", admin: true },
};
