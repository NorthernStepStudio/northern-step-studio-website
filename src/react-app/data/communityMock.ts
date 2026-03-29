export type CommunityCategoryMock = {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  sort_order: number;
  thread_count: number;
  post_count: number;
  last_thread_title?: string;
  last_thread_slug?: string;
};

export type CommunityPostMock = {
  id: number;
  content: string;
  author_id: number;
  author_name: string;
  created_at: string;
  updated_at: string;
};

export type CommunityThreadMock = {
  id: number;
  title: string;
  slug: string;
  content: string;
  category_name: string;
  category_slug: string;
  author_id: number;
  author_name: string;
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  post_count: number;
  created_at: string;
  updated_at: string;
  last_post_at: string;
  posts: CommunityPostMock[];
};

const now = Date.now();
const hoursAgo = (hours: number) => new Date(now - hours * 60 * 60 * 1000).toISOString();
const daysAgo = (days: number) => new Date(now - days * 24 * 60 * 60 * 1000).toISOString();

const MOCK_THREADS: CommunityThreadMock[] = [
  {
    id: 101,
    title: "Welcome to the sample community",
    slug: "welcome-to-the-sample-community",
    content:
      "This is a small sample community feed.\n\nUse it to preview how threads, replies, and activity cards look before the live forum fills up.",
    category_name: "General",
    category_slug: "general",
    author_id: 1,
    author_name: "Mia",
    is_pinned: true,
    is_locked: false,
    view_count: 48,
    post_count: 3,
    created_at: daysAgo(4),
    updated_at: hoursAgo(5),
    last_post_at: hoursAgo(5),
    posts: [
      {
        id: 1001,
        content: "Nice. This makes the page feel alive immediately.",
        author_id: 2,
        author_name: "Alex",
        created_at: daysAgo(3),
        updated_at: daysAgo(3),
      },
      {
        id: 1002,
        content: "Agreed. Simple sample posts are enough for the first pass.",
        author_id: 3,
        author_name: "Jordan",
        created_at: daysAgo(2),
        updated_at: daysAgo(2),
      },
      {
        id: 1003,
        content: "Perfect for testing the thread detail layout and reply flow.",
        author_id: 4,
        author_name: "Taylor",
        created_at: hoursAgo(5),
        updated_at: hoursAgo(5),
      },
    ],
  },
  {
    id: 102,
    title: "What should the first product thread be about?",
    slug: "what-should-the-first-product-thread-be-about",
    content:
      "A good first product thread usually asks for one thing: feedback on what to polish next.\n\nFor the sample data, keep it short and specific.",
    category_name: "Apps",
    category_slug: "apps",
    author_id: 5,
    author_name: "Sam",
    is_pinned: false,
    is_locked: false,
    view_count: 31,
    post_count: 2,
    created_at: daysAgo(2),
    updated_at: hoursAgo(12),
    last_post_at: hoursAgo(12),
    posts: [
      {
        id: 1004,
        content: "I would ask for feedback on the nav labels first.",
        author_id: 6,
        author_name: "Casey",
        created_at: daysAgo(1),
        updated_at: daysAgo(1),
      },
      {
        id: 1005,
        content: "Good call. Small, direct questions are easier to answer.",
        author_id: 7,
        author_name: "Riley",
        created_at: hoursAgo(12),
        updated_at: hoursAgo(12),
      },
    ],
  },
  {
    id: 103,
    title: "Missed-call follow-up: keep it simple",
    slug: "missed-call-follow-up-keep-it-simple",
    content:
      "For lead recovery, the best sample discussion is about what happens after the first text.\n\nOne reply flow, one owner summary, no extra noise.",
    category_name: "Lead Recovery",
    category_slug: "lead-recovery",
    author_id: 8,
    author_name: "Drew",
    is_pinned: false,
    is_locked: false,
    view_count: 62,
    post_count: 2,
    created_at: daysAgo(1),
    updated_at: hoursAgo(8),
    last_post_at: hoursAgo(8),
    posts: [
      {
        id: 1006,
        content: "I like the short reply menu approach. It reads fast on mobile.",
        author_id: 9,
        author_name: "Morgan",
        created_at: hoursAgo(20),
        updated_at: hoursAgo(20),
      },
      {
        id: 1007,
        content: "Yes, and the summary should be short enough to scan in one glance.",
        author_id: 10,
        author_name: "Jamie",
        created_at: hoursAgo(8),
        updated_at: hoursAgo(8),
      },
    ],
  },
  {
    id: 104,
    title: "Simple layout notes for the community card",
    slug: "simple-layout-notes-for-the-community-card",
    content:
      "This thread is just a placeholder for testing a normal, non-pinned category item.\n\nIt helps verify spacing, metadata, and the count badges.",
    category_name: "General",
    category_slug: "general",
    author_id: 11,
    author_name: "Avery",
    is_pinned: false,
    is_locked: false,
    view_count: 19,
    post_count: 1,
    created_at: daysAgo(6),
    updated_at: daysAgo(5),
    last_post_at: daysAgo(5),
    posts: [
      {
        id: 1008,
        content: "Looks clean. The community page is much easier to judge with this in place.",
        author_id: 12,
        author_name: "Quinn",
        created_at: daysAgo(5),
        updated_at: daysAgo(5),
      },
    ],
  },
  {
    id: 105,
    title: "Feedback: keep sample replies short",
    slug: "feedback-keep-sample-replies-short",
    content:
      "Short replies make mock data easier to read and less noisy during demos.\n\nThat is usually enough for the homepage and the category list.",
    category_name: "Apps",
    category_slug: "apps",
    author_id: 13,
    author_name: "Noah",
    is_pinned: false,
    is_locked: false,
    view_count: 24,
    post_count: 1,
    created_at: daysAgo(3),
    updated_at: daysAgo(2),
    last_post_at: daysAgo(2),
    posts: [
      {
        id: 1009,
        content: "Agreed. This is enough content to show activity without clutter.",
        author_id: 14,
        author_name: "Ellis",
        created_at: daysAgo(2),
        updated_at: daysAgo(2),
      },
    ],
  },
  {
    id: 106,
    title: "How many sample threads is enough?",
    slug: "how-many-sample-threads-is-enough",
    content:
      "A few extra threads make the community page feel more realistic without making it noisy.\n\nThis one is here to add a little more variety to the list.",
    category_name: "General",
    category_slug: "general",
    author_id: 15,
    author_name: "Parker",
    is_pinned: false,
    is_locked: false,
    view_count: 27,
    post_count: 2,
    created_at: daysAgo(2),
    updated_at: hoursAgo(16),
    last_post_at: hoursAgo(16),
    posts: [
      {
        id: 1010,
        content: "Three or four more is usually enough for a simple demo.",
        author_id: 16,
        author_name: "Harper",
        created_at: daysAgo(2),
        updated_at: daysAgo(2),
      },
      {
        id: 1011,
        content: "Agreed. Enough to scan, not enough to distract.",
        author_id: 17,
        author_name: "Blake",
        created_at: hoursAgo(16),
        updated_at: hoursAgo(16),
      },
    ],
  },
  {
    id: 107,
    title: "App feedback should stay short and direct",
    slug: "app-feedback-should-stay-short-and-direct",
    content:
      "Short feedback threads are easier to skim when someone opens the community page.\n\nThis sample keeps the formatting clean and the reply count low.",
    category_name: "Apps",
    category_slug: "apps",
    author_id: 18,
    author_name: "Cameron",
    is_pinned: false,
    is_locked: false,
    view_count: 22,
    post_count: 2,
    created_at: daysAgo(3),
    updated_at: hoursAgo(10),
    last_post_at: hoursAgo(10),
    posts: [
      {
        id: 1012,
        content: "That works. It makes the card layout feel more real.",
        author_id: 19,
        author_name: "Robin",
        created_at: daysAgo(2),
        updated_at: daysAgo(2),
      },
      {
        id: 1013,
        content: "And it gives the thread view a little more breathing room.",
        author_id: 20,
        author_name: "Reese",
        created_at: hoursAgo(10),
        updated_at: hoursAgo(10),
      },
    ],
  },
  {
    id: 108,
    title: "Lead recovery demo: the first text matters most",
    slug: "lead-recovery-demo-the-first-text-matters-most",
    content:
      "For sample content, the lead recovery category should show the simplest possible workflow.\n\nFast response, clear choices, and one owner summary.",
    category_name: "Lead Recovery",
    category_slug: "lead-recovery",
    author_id: 21,
    author_name: "Dylan",
    is_pinned: false,
    is_locked: false,
    view_count: 74,
    post_count: 2,
    created_at: daysAgo(1),
    updated_at: hoursAgo(4),
    last_post_at: hoursAgo(4),
    posts: [
      {
        id: 1014,
        content: "The first text should answer the call quickly and sound human.",
        author_id: 22,
        author_name: "Skyler",
        created_at: hoursAgo(18),
        updated_at: hoursAgo(18),
      },
      {
        id: 1015,
        content: "Yep. That is the core behavior the page should show.",
        author_id: 23,
        author_name: "Finley",
        created_at: hoursAgo(4),
        updated_at: hoursAgo(4),
      },
    ],
  },
];

const BASE_CATEGORIES = [
  {
    id: 1,
    name: "General",
    slug: "general",
    description: "Quick updates, simple questions, and first impressions.",
    icon: "💬",
    sort_order: 1,
  },
  {
    id: 2,
    name: "Apps",
    slug: "apps",
    description: "Feedback, ideas, and discussion around studio products.",
    icon: "📱",
    sort_order: 2,
  },
  {
    id: 3,
    name: "Lead Recovery",
    slug: "lead-recovery",
    description: "Missed-call text back, response flows, and service follow-up.",
    icon: "📞",
    sort_order: 3,
  },
] satisfies Array<{
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  sort_order: number;
}>;

export const MOCK_COMMUNITY_CATEGORIES: CommunityCategoryMock[] = BASE_CATEGORIES.map((category) => {
  const threads = MOCK_THREADS.filter((thread) => thread.category_slug === category.slug);
  const threadCount = threads.length;
  const postCount = threads.reduce((total, thread) => total + thread.posts.length, 0);
  const latestThread = threads.reduce<CommunityThreadMock | null>(
    (latest, thread) => {
      if (!latest) return thread;
      return new Date(thread.last_post_at).getTime() > new Date(latest.last_post_at).getTime()
        ? thread
        : latest;
    },
    null,
  );

  return {
    ...category,
    thread_count: threadCount,
    post_count: postCount,
    last_thread_title: latestThread?.title,
    last_thread_slug: latestThread?.slug,
  };
});

export function getMockCommunityCategories() {
  return [...MOCK_COMMUNITY_CATEGORIES].sort((left, right) => left.sort_order - right.sort_order);
}

export function getMockCommunityThreads() {
  return [...MOCK_THREADS].sort(
    (left, right) => new Date(right.last_post_at).getTime() - new Date(left.last_post_at).getTime(),
  );
}

export function getMockCommunityThreadsForCategory(categorySlug: string, searchQuery = "") {
  const query = searchQuery.trim().toLowerCase();
  return getMockCommunityThreads().filter((thread) => {
    if (thread.category_slug !== categorySlug) return false;
    if (!query) return true;

    return [
      thread.title,
      thread.content,
      thread.author_name,
      thread.category_name,
      ...thread.posts.map((post) => post.content),
    ].some((value) => value.toLowerCase().includes(query));
  });
}

export function getMockCommunityThreadBySlug(slug: string) {
  return MOCK_THREADS.find((thread) => thread.slug === slug) ?? null;
}

export function searchMockCommunityThreads(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  return getMockCommunityThreads().filter((thread) =>
    [thread.title, thread.content, thread.author_name, thread.category_name].some((value) =>
      value.toLowerCase().includes(normalized),
    ),
  );
}
