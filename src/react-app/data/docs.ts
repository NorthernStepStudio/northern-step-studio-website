export interface DocsArticle {
  slug: string;
  category: "getting-started" | "apps" | "ai-tools";
  summary: string;
  body: string;
}

export const docsArticles: DocsArticle[] = [
  {
    slug: "welcome",
    category: "getting-started",
    summary: "Understand what Northern Step Studio builds and how the public site is organized.",
    body: `# Welcome to Northern Step Studio

Northern Step Studio builds practical software products across mobile apps, guided learning tools, lightweight games, and business automation.

## What you can do here

- Browse active products in the app catalog
- Read build updates and release notes
- Explore community discussions
- Manage your studio account and profile

## Where to start

If you're new, open the **Apps** page first. Each product page includes the current build stage, feature set, platform, and public next steps.

## Need help?

Use the **Contact** page for support, partnership questions, or access requests.`,
  },
  {
    slug: "first-app",
    category: "getting-started",
    summary: "Find the right product, understand its status, and follow the safest path to access.",
    body: `# Download Your First App

Not every product on the site is in the same release stage. Some are live, some are in beta, and some are still moving through internal milestones.

## Before you click download

- Check the product status badge
- Review the platform listed on the product page
- Read the milestone checklist to understand what is complete

## If a build is not public yet

The safest next step is to use the product CTA or the Contact page to request access. We prefer that over shipping broken public links.

## Best practice

Always read the product detail page before installing. It is the source of truth for scope, platform, and current readiness.`,
  },
  {
    slug: "account-setup",
    category: "getting-started",
    summary: "Use Google or password login, complete your profile, and keep user and admin entry points separate.",
    body: `# Account Setup

The website supports two sign-in paths:

- Standard users can use the regular login page with Google or an account password
- Studio admins can use the separate admin login page, including password access for approved domain email accounts

## After sign-in

- Regular users land on their profile
- Moderators and admins land in the admin console
- Everyone can still access their own profile and preferences

## Password access

If your account started with Google, sign in once and open **Preferences** to add a password. That keeps both login methods available on the same account.

## Complete your profile

Open **Profile** to:

- Set your display name
- Add a short bio
- Review your community activity
- Jump to notification preferences

## Roles

Your role controls which pages appear in the admin console. Public catalog pages remain separate from account management.`,
  },
  {
    slug: "app-features",
    category: "apps",
    summary: "Understand how product pages describe status, roadmap progress, and feature readiness.",
    body: `# App Features

Every product page on the site is structured around three things: scope, readiness, and next actions.

## What the product page shows

- Core description and positioning
- Current status, such as Beta or Alpha
- Platform and target timeline
- Milestone checklist
- Key features that are already planned or implemented

## Why this matters

We do not want public copy to imply a product is finished when it is not. The build progress section is there to make maturity obvious.

## If something looks outdated

Check the updates page or contact the studio. Product copy gets revised as repositories and internal assets change.`,
  },
  {
    slug: "troubleshooting",
    category: "apps",
    summary: "Common checks when a public page, download action, or account screen does not behave correctly.",
    body: `# Troubleshooting

If something feels broken, start with the basics before assuming the product itself is unavailable.

## Quick checks

- Refresh the page after sign-in completes
- Confirm the route exists in the navigation or sitemap
- Make sure you are opening the correct profile or admin page for your role
- Use the updates page to see whether a feature is intentionally offline

## Missing content

If a page link opens but the content is incomplete, it may have been replaced by a newer product route or update article.

## Still blocked?

Use the Contact page and include:

- The page URL
- What you expected to happen
- What actually happened`,
  },
  {
    slug: "updates",
    category: "apps",
    summary: "See how updates are published and why release notes are separate from long-form blog posts.",
    body: `# How Updates Work

The site uses a dedicated updates feed for product news, build milestones, and release notes.

## Why not a traditional blog only?

Product updates need to stay close to the app catalog and admin workflow. That keeps release copy visible without relying on a separate content system for every small change.

## What an update can include

- Release notes
- Progress reports
- Feature announcements
- Product-specific CTA links

## Best place to track momentum

Use the **Updates** page for current movement, then open the linked product page for deeper context.`,
  },
  {
    slug: "ai-introduction",
    category: "ai-tools",
    summary: "What the studio means by AI tools and where automation fits into the product lineup.",
    body: `# Introduction to AI Tools

Northern Step Studio uses AI where it makes the product faster, clearer, or more adaptive.

## Typical AI use cases in the studio

- Recommendations and guided choices
- Automation for repetitive tasks
- Assisted categorization or parsing
- Faster response workflows for business systems

## What AI is not used for

We avoid pretending AI solves everything. Several products are explicitly deterministic first, with AI layered in only where it improves the user outcome.`,
  },
  {
    slug: "ai-usage",
    category: "ai-tools",
    summary: "Set expectations correctly and use the feature scope on product pages to avoid over-trusting AI behavior.",
    body: `# Getting Better Results From AI Features

The quality of AI output depends on the product and the problem being solved.

## Best practices

- Read the product feature list before using an AI-assisted workflow
- Prefer structured inputs when the product supports them
- Use the non-AI fallback path when accuracy matters more than speed

## Studio rule

We treat AI as an operator or assistant, not as permission to skip product discipline.`,
  },
  {
    slug: "ai-privacy",
    category: "ai-tools",
    summary: "How privacy boundaries differ between local-first products and cloud-assisted systems.",
    body: `# AI and Privacy

Privacy boundaries vary by product, so the public site should never imply the same data model across every app.

## What to look for

- Whether the product is local-first
- Whether AI features are optional
- Whether uploads or parsing happen on-device or through a service

## Practical rule

If privacy matters for your workflow, read the product page and privacy policy together before using an AI-assisted feature.`,
  },
];

export function getDocsArticleBySlug(slug: string): DocsArticle | undefined {
  return docsArticles.find((article) => article.slug === slug);
}
