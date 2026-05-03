import { Link, useParams } from "react-router";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, BookOpen, ChevronRight } from "lucide-react";
import SEO from "@/react-app/components/SEO";
import { getDocsArticleBySlug } from "@/react-app/data/docs";
import { brandifyMarkdown, brandifyText, isBrandText } from "@/react-app/lib/brand";

export default function DocsArticle() {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? getDocsArticleBySlug(slug) : undefined;

  if (!article) {
    return (
      <div className="min-h-screen pt-24 px-4 sm:px-6 pb-16">
        <div className="container mx-auto max-w-3xl">
          <div className="card-dark-wise text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-5">
              <BookOpen className="w-7 h-7 text-accent" />
            </div>
            <h1 className="text-2xl font-black uppercase mb-3">Article Not Found</h1>
            <p className="text-sm text-muted-foreground mb-6">
              The documentation link exists, but this article is not published yet.
            </p>
            <Link to="/docs" className="btn-pill-primary inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Docs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 pb-16">
      <SEO title={article.slug.replace(/-/g, " ")} description={article.summary} canonicalUrl={`/docs/${article.slug}`} />

      <article className="container mx-auto max-w-3xl">
        <nav className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground mb-6">
          <Link to="/docs" className="hover:text-accent transition-colors">
            Docs
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>{article.category.replace("-", " ")}</span>
        </nav>

        <Link
          to="/docs"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Knowledge Base
        </Link>

        <header className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/30 mb-5">
            <BookOpen className="w-4 h-4 text-accent" />
            <span className="text-xs font-black uppercase text-accent">{article.category.replace("-", " ")}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter mb-4">
            {article.slug.replace(/-/g, " ")}
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">{brandifyText(article.summary)}</p>
        </header>

        <div className="card-dark-wise">
          <div className="prose prose-invert max-w-none prose-p:text-foreground/90 prose-li:text-foreground/90 prose-strong:text-foreground prose-headings:text-foreground prose-headings:uppercase prose-headings:tracking-tight prose-headings:font-black prose-a:text-accent">
            <ReactMarkdown
              components={{
                strong: ({ children }) => (
                  <strong className={isBrandText(children) ? "font-black text-accent" : "font-semibold text-foreground"}>
                    {children}
                  </strong>
                ),
              }}
            >
              {brandifyMarkdown(article.body)}
            </ReactMarkdown>
          </div>
        </div>
      </article>
    </div>
  );
}
