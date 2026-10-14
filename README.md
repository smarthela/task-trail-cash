# Trace Work Hub

Build a complete, production-ready, mobile-first digital earning and work marketplace called SmartHELA.



The product should feel like a serious modern fintech + gig marketplace + rewards platform — NOT like a cheap “paid-to-click” website.



The core idea:



TRACE = one place where people can discover legitimate ways to earn money online, complete tasks, find freelance work, participate in brand/research campaigns, discover deals, refer genuine users, and manage their earnings through an internal wallet.



Do not create a superficial mockup. Build the actual application architecture, database structure, authentication, user flows, admin controls, wallet ledger, task system, campaign system, referral system, withdrawal system, and marketplace foundations.



---



1. DESIGN SYSTEM



Mobile-first is the highest priority.



Design for Android phones first, then make it responsive for tablets and desktop.



Visual direction:



- Premium fintech aesthetic

- Near-black/dark foundation

- Violet/lavender Trace accent

- Clean modern typography

- OLED-friendly dark UI

- Large rounded cards

- Subtle glass/frosted surfaces

- Excellent spacing

- Strong visual hierarchy

- Smooth micro-interactions

- Professional financial-dashboard feel

- Avoid excessive gradients

- Avoid childish gamification

- Avoid clutter

- Avoid generic template appearance



The app should feel comparable in polish to a modern fintech, creator economy and freelance platform combined.



Use KSh as the primary currency throughout the Kenyan version.



Never use fake earnings, fake users, fake task counts or fake transactions in production.



---



2. AUTHENTICATION



Create:



- Sign up

- Login

- Logout

- Password reset

- Email/phone verification

- Profile creation

- Username

- Profile photo

- Skills

- Location at broad level only

- Referral code

- Account status



Users should have roles:



- User

- Freelancer

- Advertiser/Campaign owner

- Admin

- Super Admin



A user can eventually have multiple capabilities without creating separate accounts.



---



3. MAIN MOBILE NAVIGATION



Use a fixed bottom navigation:



Home

Earn

Work

Wallet

Profile



Keep it compact and mobile-friendly.



Do not add unnecessary navigation items.



Secondary features should live inside these sections.



---



4. HOME DASHBOARD



The Home screen is the user's personal earning cockpit.



Header:



“Good evening, [Name]”



Wallet card:



KSh 1,842.50

Available balance



Buttons:



Withdraw

View wallet



Show:



- Today's earnings

- This month's earnings

- Lifetime earnings

- Pending earnings



Then:



Earn Today



Show personalized opportunities:



- Surveys

- Microtasks

- Campaigns

- Freelance jobs

- Offers

- Skill-based tasks



Each opportunity card should display:



- Title

- Category

- Estimated completion time

- Reward

- Requirements

- Status

- CTA



Example:



Market Research Survey

7 min

KSh 80

Start



Do not hard-code these examples. Load real opportunities from the database.



Then:



Quick Actions



Earn

Withdraw

Refer

Deals



Then:



Recommended For You



Personalize recommendations using:



- User skills

- Previous completed tasks

- Categories

- Location eligibility

- User level



---



5. EARN SECTION



Create a powerful task marketplace.



Top:



Find your next earning opportunity



Search bar.



Categories:



- All

- Quick Tasks

- Surveys

- Research

- Campaigns

- Offers

- Data Tasks

- AI Tasks

- Content

- Referrals

- Other



Every task must have:



- Unique ID

- Title

- Description

- Category

- Reward

- Estimated time

- Requirements

- Maximum participants if applicable

- Start/end date

- Verification method

- Task status

- Sponsor

- Budget

- Completion limit

- User eligibility rules



Task states:



Draft

Published

Active

Paused

Completed

Expired

Rejected



Users should be able to open a task and see complete instructions.



---



6. TASK COMPLETION ENGINE



Build a proper task lifecycle:



Available → Started → Submitted → Under Review → Approved/Rejected → Rewarded



Do not immediately credit money simply because a button was clicked.



Tasks should support different verification mechanisms depending on the task:



- Automatic verification

- Upload proof

- Text submission

- Link submission

- Survey completion

- API verification where available

- Manual admin review



Store every submission.



Admins must be able to review submissions.



When a task is approved, create a wallet ledger transaction.



Never directly modify a user's balance without a corresponding ledger entry.



---



7. SURVEY SYSTEM



Build a survey marketplace.



Survey creators/admins can create:



- Questions

- Multiple choice

- Single choice

- Text answers

- Ratings

- Demographics

- Eligibility questions



Support:



- Survey targeting

- Completion limits

- Closing dates

- Reward amount

- Response tracking

- Fraud prevention

- Duplicate-response detection



Users see:



Survey title

Estimated time

Reward

Eligibility



Then:



Start Survey



---



8. CAMPAIGN MARKETPLACE



This is one of the most important parts of TRACE.



Businesses, creators, organizations and approved campaign owners can create campaigns.



Examples:



- Product awareness

- Brand discovery

- Research

- Event promotion

- Creator campaigns

- Content campaigns

- Customer feedback

- Legitimate promotional activities

- Voting-awareness campaigns where permitted



Do NOT build the system around fake engagement, fake followers, fake reviews, bot activity, or manipulation of platform metrics.



Campaign owners define:



- Campaign name

- Description

- Objective

- Target audience

- Number of participants

- Reward per completed action

- Total campaign budget

- Start/end date

- Instructions

- Verification requirements



Campaign owner must fund the campaign before tasks become active.



Use a campaign budget/escrow ledger.



Example:



Campaign budget:

KSh 100,000



Allocated:

KSh 40,000



Remaining:

KSh 60,000



Completed tasks automatically move the appropriate reward from the campaign budget ledger to the user's pending/available earnings according to the verification rules.



---



9. VOTING / NOMINATION CAMPAIGNS



Create a campaign type for legitimate voting and nomination promotions.



Users can discover campaigns and complete permitted promotional actions.



Campaign owners can monitor:



- Participants

- Completed actions

- Budget spent

- Remaining budget

- Campaign performance



Do not facilitate fraudulent votes, vote buying where prohibited, automated voting, duplicate voting, or manipulation of third-party voting systems.



---



10. FREELANCE / WORK MARKETPLACE



The Work section should feel like a lightweight freelance marketplace.



Categories:



- Writing

- Editing

- Graphic Design

- Video Editing

- Voice Over

- Translation

- Coding

- Virtual Assistance

- Data Entry

- Research

- Social Media

- Other



Users can:



- Create a freelancer profile

- Add skills

- Set portfolio

- Set rates

- Apply for jobs

- Receive offers

- Track active work

- Submit completed work

- Receive ratings



Clients can:



- Post jobs

- Set budgets

- Review applicants

- Hire workers

- Fund jobs

- Review submissions

- Approve work



Build the architecture for milestone-based work.



---



11. DIGITAL MARKETPLACE



Create a Marketplace area inside the product.



Users/approved sellers can eventually sell:



- Templates

- Digital documents

- Design assets

- E-books

- Presets

- Social media assets

- Website templates

- Prompts

- Other digital products



Support:



- Product listing

- Price

- Preview

- Description

- Seller

- Purchases

- Downloads

- Reviews

- Platform commission



Do not allow copyright-infringing material or stolen products.



---



12. DEALS & OFFERS



Create:



Deals



Include:



- Partner offers

- Discounts

- Cashback opportunities

- Promo codes

- Affiliate offers

- Data bundles

- Digital services

- Local offers



Each offer should contain:



- Provider

- Description

- Reward/discount

- Requirements

- Expiry

- Tracking

- Verification



---



13. REFERRAL SYSTEM



Build a proper referral engine.



Every user gets a unique referral code/link.



Referral dashboard:



Referral earnings

Total referrals

Active referrals

Pending rewards



Users can share their referral link.



Support configurable referral rewards.



For example:



User A refers User B.



If User B completes the required qualifying action:



User A receives the configured referral reward.



Do not reward recruitment alone if the business model would become a pyramid scheme.



If membership fees are introduced, make the product provide genuine standalone value and ensure referral compensation is tied to legitimate qualifying activity rather than simply recruiting people.



Build the system so referral rules can be configured by admins.



---



14. REWARDS / GAMIFICATION



Create a Rewards section.



Features:



Daily Check-in



Users can claim a daily reward according to configured rules.



Streaks



Track consecutive participation days.



Challenges



Examples:



Complete 5 tasks

Complete 3 surveys

Earn KSh 500

Complete a campaign



Levels



Example:



Bronze

Silver

Gold

Platinum



Level progression should use XP earned from legitimate activity.



Badges



Examples:



First Task

10 Tasks

First Withdrawal

Top Freelancer

Survey Master

Referral Milestone



Spin Wheel



Create a configurable reward wheel.



Admins can configure:



- Rewards

- Probability

- Frequency

- Eligibility

- Daily limits



Do not manipulate outcomes secretly.



If the wheel uses paid entry or has gambling-like mechanics, keep the architecture disabled until the relevant legal/compliance requirements are satisfied.



---



15. WALLET SYSTEM



This is extremely important.



Build an internal wallet using a proper transaction ledger.



Every user has:



Available balance

Pending balance

Lifetime earnings

Total withdrawn



Wallet transactions must include:



- Transaction ID

- User ID

- Amount

- Type

- Source

- Status

- Timestamp

- Reference

- Description



Transaction types:



TASK_REWARD

SURVEY_REWARD

CAMPAIGN_REWARD

REFERRAL_REWARD

BONUS

FREELANCE_PAYMENT

MARKETPLACE_EARNING

WITHDRAWAL

REFUND

ADJUSTMENT



Never simply overwrite a wallet balance.



Balance should be derived from valid ledger transactions or maintained through carefully controlled atomic accounting.



---



16. WITHDRAWAL SYSTEM



Users tap:



Withdraw



They select a supported withdrawal method.



For Kenya, initially prepare the architecture for M-Pesa payouts through an appropriate payment provider/API rather than pretending payments have happened.



User enters:



- Amount

- Withdrawal method

- Destination details



Then:



Pending Approval



Admin dashboard displays:



User

Amount

Method

Requested date

Status



Admin actions:



Approve

Reject

Cancel



Withdrawal states:



Requested

Pending Review

Approved

Processing

Paid

Rejected

Cancelled

Failed



If rejected/cancelled before payment, the reserved funds must be returned to the user's available balance through a proper ledger transaction.



If approved, record the payout reference.



Never mark a withdrawal as “Paid” unless the actual payout provider confirms it.



---



17. ADMIN DASHBOARD



Build a powerful admin dashboard.



Overview:



- Total users

- Active users

- Tasks completed

- Money earned by users

- Pending withdrawals

- Completed withdrawals

- Campaign budgets

- Platform revenue

- Freelance jobs

- Survey responses

- Fraud alerts



Admin sections:



Users

Tasks

Task submissions

Surveys

Campaigns

Freelance jobs

Marketplace

Deals

Referrals

Rewards

Wallets

Withdrawals

Transactions

Reports

Fraud

Settings



Admins can approve/reject/pause content.



---



18. PLATFORM REVENUE



Build configurable monetization.



Possible revenue streams:



- Campaign commission

- Marketplace commission

- Freelance transaction fee

- Sponsored placements

- Business subscriptions

- Survey/research fees

- Affiliate commissions

- Featured campaigns

- Premium user features



Every platform fee should be recorded as its own ledger transaction.



---



19. FRAUD & SECURITY



Build the foundations for:



- Duplicate task detection

- Duplicate survey responses

- Suspicious referral patterns

- Multiple-account detection signals

- Abnormally fast task completion

- Excessive withdrawal attempts

- Device/session signals

- IP/risk signals where legally appropriate

- Manual fraud review

- Account suspension

- Transaction audit logs



Never allow users to exploit tasks repeatedly.



---



20. NOTIFICATIONS



Create notifications for:



- New task available

- Task approved

- Task rejected

- Earnings received

- Withdrawal requested

- Withdrawal approved

- Withdrawal paid

- Referral reward

- Campaign updates

- New freelance opportunity

- New message

- Security alerts



---



21. USER PROFILE



Profile should show:



Profile picture

Name

Username

Level

XP

Skills

Portfolio

Completed tasks

Freelance rating

Referral stats

Achievements



Settings:



Account

Security

Notifications

Withdrawal methods

Privacy

Help

Terms

Logout



---



22. SEARCH & DISCOVERY



Build global search where appropriate.



Users should be able to search:



Tasks

Surveys

Campaigns

Freelance jobs

Deals

Digital products



Use filters:



Reward

Category

Time required

Skill

Newest

Highest paying

Ending soon



---



23. DATABASE ARCHITECTURE



Use Supabase/PostgreSQL.



Create normalized tables for at least:



profiles

roles

tasks

task_submissions

surveys

survey_questions

survey_responses

campaigns

campaign_participants

freelance_jobs

freelance_applications

contracts

milestones

marketplace_products

marketplace_orders

deals

referrals

referral_rewards

rewards

challenges

badges

user_badges

wallets

wallet_transactions

withdrawal_requests

payment_methods

notifications

admin_actions

fraud_flags

platform_settings



Use proper foreign keys, indexes and Row Level Security.



Users must only access their own private financial information and submissions.



Admins have controlled elevated access.



Never expose service-role credentials in frontend code.



---



24. REAL-TIME EXPERIENCE



Where appropriate, use realtime updates for:



- Wallet changes

- Task availability

- Withdrawal status

- Notifications

- Campaign progress

- Messages



The interface should feel alive without unnecessary animations.



---



25. EMPTY STATES



Every section must have proper empty states.



Examples:



“No tasks available right now.”



“No withdrawal requests yet.”



“No freelance applications yet.”



“No referrals yet.”



Never leave blank screens.



---



26. LOADING / ERROR STATES



Build proper:



- Skeleton loaders

- Loading states

- Retry states

- Network errors

- Form validation

- Permission errors

- Authentication errors



Never leave the user stuck on an infinite spinner.



---



27. MOBILE UX



Prioritize:



- Thumb-friendly controls

- Bottom navigation

- Large tap targets

- Fast page transitions

- Minimal typing

- Bottom sheets where appropriate

- Sticky CTAs

- Safe-area support

- Android Chrome compatibility

- Responsive keyboard behavior



The application must feel like a real mobile product even when accessed through a browser.



---



28. ADMIN CONFIGURATION



Do not hard-code business rules.



Create admin-configurable settings for:



- Task reward limits

- Referral rewards

- Platform commission

- Minimum withdrawal

- Withdrawal fees

- User levels

- XP rules

- Daily rewards

- Spin-wheel probabilities

- Campaign limits

- Marketplace commission

- Supported currencies

- Supported payout methods



---



29. IMPORTANT BUSINESS RULE



The platform must distinguish between:



Pending earnings



and



Available earnings



A task can be completed but remain pending until verification.



Only verified earnings become withdrawable.



Withdrawals should reserve the relevant balance so the same money cannot be withdrawn twice.



Use atomic database operations for financial transactions.



---



30. TRUST & TRANSPARENCY



Create a transaction history that users can understand.



Every earning should say exactly where it came from.



Example:



+KSh 80

Market Research Survey

Completed Oct 8, 2026



Every withdrawal should show:



−KSh 500

M-Pesa Withdrawal

Pending



This is essential for user trust.



---



31. FINAL UI STRUCTURE



Bottom navigation:



Home | Earn | Work | Wallet | Profile



Home:

Wallet + personalized earning opportunities



Earn:

Tasks + surveys + campaigns + offers + rewards



Work:

Freelancing + gigs + professional work



Wallet:

Balance + transactions + withdrawals



Profile:

Identity + skills + referrals + achievements + settings



Keep the product cohesive.



Do not create ten unrelated mini-apps inside one application.



Everything should feel like one ecosystem.



---



32. PRODUCT PRINCIPLE



The user's journey should be:



Discover → Complete → Verify → Earn → Build reputation → Unlock better opportunities → Withdraw



The long-term goal is to move users from tiny microtasks into higher-value work.



Someone can start by earning KSh 20 from a simple task and eventually earn KSh 5,000+ from a freelance job.



That progression should be visible throughout the product.



---



33. DEVELOPMENT REQUIREMENT



Build this as a real scalable application, not a static prototype.



Prioritize in this order:



1. Authentication

2. Database schema

3. Wallet ledger

4. Task engine

5. Task submission/verification

6. Withdrawal workflow

7. Admin dashboard

8. Campaign system

9. Surveys

10. Referrals

11. Rewards

12. Freelance marketplace

13. Deals

14. Digital marketplace

15. Notifications

16. Fraud/security foundations

17. Final UI polish



Do not remove existing working functionality when implementing new modules.



Do not replace functional backend logic with mock data.



Do not create fake financial transactions.



Do not hard-code balances.



Do not expose secrets.



If an external payment/API integration is not yet configured, build the integration interface and clearly show the connection/configuration requirement rather than pretending it is operational.



The finished application should feel like a serious, scalable African digital earning and work ecosystem, with TRACE branding and a premium mobile-first experience.





CHOOSE bright colors like white, red and blue ..... Pink and some nice blends

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://task-trail-cash.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4aedd777-01a4-404b-a399-1f56a1f555f6).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
