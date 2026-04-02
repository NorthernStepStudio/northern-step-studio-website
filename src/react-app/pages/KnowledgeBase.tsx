import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import {
  BookOpen,
  Search,
  Smartphone,
  Sparkles,
  HelpCircle,
  MessageCircle,
  ChevronRight,
  ExternalLink,
  Mail,
  Rocket,
  Shield,
  Zap,
  Download,
} from "lucide-react";
import GlitchedText from "@/react-app/components/GlitchedText";
import SEO from "@/react-app/components/SEO";

interface DocCategory {
  id: string;
  icon: React.ElementType;
  titleKey: string;
  descKey: string;
  articles: { titleKey: string; slug: string }[];
}

export default function KnowledgeBase() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const categories = useMemo<DocCategory[]>(
    () => [
      {
        id: "getting-started",
        icon: Rocket,
        titleKey: "kb.categories.getting_started.title",
        descKey: "kb.categories.getting_started.desc",
        articles: [
          { titleKey: "kb.articles.welcome", slug: "welcome" },
          { titleKey: "kb.articles.first_app", slug: "first-app" },
          { titleKey: "kb.articles.account", slug: "account-setup" },
        ],
      },
      {
        id: "apps",
        icon: Smartphone,
        titleKey: "kb.categories.apps.title",
        descKey: "kb.categories.apps.desc",
        articles: [
          { titleKey: "kb.articles.app_features", slug: "app-features" },
          { titleKey: "kb.articles.troubleshooting", slug: "troubleshooting" },
          { titleKey: "kb.articles.updates", slug: "updates" },
        ],
      },
      {
        id: "ai-tools",
        icon: Sparkles,
        titleKey: "kb.categories.ai.title",
        descKey: "kb.categories.ai.desc",
        articles: [
          { titleKey: "kb.articles.ai_intro", slug: "ai-introduction" },
          { titleKey: "kb.articles.ai_usage", slug: "ai-usage" },
          { titleKey: "kb.articles.ai_privacy", slug: "ai-privacy" },
        ],
      },
    ],
    []
  );

  const faqKeys = [1, 2, 3, 4, 5];
  const faqs = faqKeys.map((i) => ({
    q: t(`kb.faqs.q${i}`),
    a: t(`kb.faqs.a${i}`),
  }));

  const quickLinks = [
    { icon: Download, titleKey: "kb.quick.download", href: "/apps" },
    { icon: Shield, titleKey: "kb.quick.privacy", href: "/privacy" },
    { icon: Zap, titleKey: "kb.quick.updates", href: "/updates" },
    { icon: Mail, titleKey: "kb.quick.contact", href: "/contact" },
  ];

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredCategories = useMemo(() => {
    if (!normalizedQuery) {
      return categories;
    }

    return categories
      .map((category) => {
        const matchingArticles = category.articles.filter((article) =>
          t(article.titleKey).toLowerCase().includes(normalizedQuery)
        );
        const categoryMatches =
          t(category.titleKey).toLowerCase().includes(normalizedQuery) ||
          t(category.descKey).toLowerCase().includes(normalizedQuery);

        if (categoryMatches) {
          return category;
        }

        return matchingArticles.length > 0
          ? {
              ...category,
              articles: matchingArticles,
            }
          : null;
      })
      .filter((category): category is DocCategory => Boolean(category));
  }, [categories, normalizedQuery, t]);

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 pb-12">
      <SEO
        title={t("kb.title")}
        description={t("seo.kb_description")}
        keywords="Northern Step Studio docs, product help, support guides, studio automation docs"
        canonicalUrl="/docs"
      />
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 border border-accent/30 mb-4">
            <BookOpen className="w-8 h-8 text-accent" />
          </div>
          <span className="text-label text-accent mb-2 block text-xs sm:text-sm">
            {t("kb.label")}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter mb-4">
            <GlitchedText text={t("kb.title")} duration={600} />
          </h1>
          <p className="text-muted-foreground font-normal max-w-2xl mx-auto text-sm sm:text-base">
            {t("kb.subtitle")}
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("kb.search_placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all text-sm"
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {quickLinks.map((link, index) => (
            <Link
              key={index}
              to={link.href}
              className="card-dark-wise flex items-center gap-3 group hover:border-accent/50 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <link.icon className="w-5 h-5 text-accent" />
              </div>
              <span className="text-sm font-medium">{t(link.titleKey)}</span>
            </Link>
          ))}
        </div>

        {/* Categories Grid */}
        <div className="mb-12">
          <h2 className="text-xl font-black uppercase mb-6">{t("kb.browse_topics")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCategories.map((category) => (
              <div key={category.id} className="card-dark-wise">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <category.icon className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-black uppercase text-lg mb-1">
                      {t(category.titleKey)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t(category.descKey)}
                    </p>
                  </div>
                </div>
                <ul className="space-y-2 ml-16">
                  {category.articles.map((article, idx) => (
                    <li key={idx}>
                      <Link
                        to={`/docs/${article.slug}`}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors group"
                      >
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        {t(article.titleKey)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {filteredCategories.length === 0 && (
            <div className="card-dark-wise text-center py-12">
              <Search className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-foreground font-black uppercase mb-2">{t("kb.empty_title")}</p>
              <p className="text-sm text-muted-foreground">{t("kb.empty_desc")}</p>
            </div>
          )}
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-accent" />
            </div>
            <h2 className="text-xl font-black uppercase">{t("kb.faq_title")}</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="card-dark-wise cursor-pointer"
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm sm:text-base pr-4">{faq.q}</h3>
                  <ChevronRight
                    className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 ${
                      expandedFaq === index ? "rotate-90" : ""
                    }`}
                  />
                </div>
                {expandedFaq === index && (
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="card-dark-wise border-accent/30 text-center">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-7 h-7 text-accent" />
          </div>
          <h2 className="text-xl font-black uppercase mb-2">{t("kb.support.title")}</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            {t("kb.support.desc")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/contact" className="btn-pill-primary">
              {t("kb.support.contact")}
            </Link>
            <a
              href="mailto:hello@northernstepstudio.com"
              className="btn-pill-ghost inline-flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              hello@northernstepstudio.com
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
