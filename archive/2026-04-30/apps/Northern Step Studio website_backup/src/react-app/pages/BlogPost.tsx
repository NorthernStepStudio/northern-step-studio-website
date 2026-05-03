import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { useTranslation } from "react-i18next";
import { apiFetch } from "@/react-app/lib/api";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Calendar, Clock, Globe } from "lucide-react";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image: string | null;
  language: string;
  published_at: string;
}

export default function BlogPost() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await apiFetch(`/api/blog/${slug}`);
        if (!res.ok) {
          setError(true);
          return;
        }
        const data = await res.json();
        setPost(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [slug]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const estimateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
  };

  const languageLabels: Record<string, string> = {
    en: "English",
    es: "Español",
    it: "Italiano",
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4 sm:px-6">
        <div className="container mx-auto max-w-3xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="h-12 bg-muted rounded w-3/4" />
            <div className="h-64 bg-muted rounded" />
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded" />
              <div className="h-4 bg-muted rounded w-5/6" />
              <div className="h-4 bg-muted rounded w-4/6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen pt-24 px-4 sm:px-6">
        <div className="container mx-auto max-w-3xl">
          <div className="card-dark-wise text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">📄</span>
            </div>
            <h3 className="text-xl font-black uppercase mb-3">{t("blog.not_found")}</h3>
            <p className="text-muted-foreground font-normal mb-6">
              {t("blog.not_found_desc")}
            </p>
            <Link to="/blog" className="btn-pill-primary inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              {t("blog.back_to_blog")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 pb-16">
      <article className="container mx-auto max-w-3xl">
        {/* Back link */}
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">{t("blog.back_to_blog")}</span>
        </Link>

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter mb-6">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(post.published_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{estimateReadTime(post.content)} min read</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>{languageLabels[post.language] || post.language}</span>
            </div>
          </div>
        </header>

        {/* Cover image */}
        {post.cover_image && (
          <div className="mb-8 rounded-2xl overflow-hidden">
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-invert prose-lg max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-3xl font-black uppercase tracking-tighter mt-12 mb-6">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-2xl font-black uppercase tracking-tighter mt-10 mb-4">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xl font-bold mt-8 mb-3">{children}</h3>
              ),
              p: ({ children }) => (
                <p className="text-foreground/90 leading-relaxed mb-6">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside space-y-2 mb-6 text-foreground/90">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside space-y-2 mb-6 text-foreground/90">
                  {children}
                </ol>
              ),
              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-accent pl-6 py-2 my-6 bg-accent/5 rounded-r-lg italic text-foreground/80">
                  {children}
                </blockquote>
              ),
              code: ({ className, children }) => {
                const isInline = !className;
                if (isInline) {
                  return (
                    <code className="bg-muted px-2 py-1 rounded text-sm font-mono text-accent">
                      {children}
                    </code>
                  );
                }
                return (
                  <code className="block bg-muted p-4 rounded-lg text-sm font-mono overflow-x-auto mb-6">
                    {children}
                  </code>
                );
              },
              pre: ({ children }) => (
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-6">
                  {children}
                </pre>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  className="text-accent hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ),
              img: ({ src, alt }) => (
                <img
                  src={src}
                  alt={alt}
                  className="rounded-xl my-8 w-full"
                />
              ),
              hr: () => <hr className="border-border my-10" />,
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-border">
          <Link
            to="/blog"
            className="btn-pill-primary inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("blog.back_to_blog")}
          </Link>
        </footer>
      </article>
    </div>
  );
}
