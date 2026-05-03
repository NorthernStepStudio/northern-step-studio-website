export interface SiteFaqEntry {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
  readonly tags: readonly string[];
  readonly url: string;
}

export const siteFaqEntries: readonly SiteFaqEntry[] = [
  {
    id: "getting-started",
    question: "How do I find the right product to start with?",
    answer:
      "Start on the Apps page, review the product status badge, and read the product detail page before installing or requesting access.",
    tags: ["apps", "product", "status", "start"],
    url: "/docs/welcome",
  },
  {
    id: "access",
    question: "What should I do if a product is not public yet?",
    answer:
      "Use the product CTA or the Contact page to request access. The public site does not treat every product as ready at the same time.",
    tags: ["access", "public", "coming-soon", "contact"],
    url: "/contact",
  },
  {
    id: "profiles",
    question: "How do sign-in and profiles work?",
    answer:
      "Regular users sign in through the public login flow and land on their profile. Approved admins use the separate admin login and land in the console.",
    tags: ["login", "profile", "admin", "roles"],
    url: "/docs/account-setup",
  },
  {
    id: "updates",
    question: "Where do I check release notes and product movement?",
    answer:
      "Use the Updates page for release notes, progress reports, and product movement. Then open the linked product page for deeper context.",
    tags: ["updates", "release", "product", "milestones"],
    url: "/updates",
  },
  {
    id: "ai-scope",
    question: "How do AI tools fit into the studio?",
    answer:
      "AI is used where it makes the product clearer, faster, or more adaptive. We keep deterministic flows where accuracy matters and layer AI on top when it helps.",
    tags: ["ai", "tools", "privacy", "guidance"],
    url: "/docs/ai-introduction",
  },
  {
    id: "support",
    question: "How do I contact the studio?",
    answer:
      "Use the Contact page for support, partnership questions, or access requests. Include the URL, the expected behavior, and what actually happened.",
    tags: ["support", "contact", "help"],
    url: "/contact",
  },
] as const;
