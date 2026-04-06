import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { BRAND_ASSETS, resolveSiteUrl } from "@/react-app/lib/site";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
  structuredData?: object;
}

export default function SEO({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage,
  ogType = "website",
  noindex = false,
  structuredData,
}: SEOProps) {
  const { t } = useTranslation();
  const defaultTitle = t("seo.default_title");
  const defaultDescription = t("seo.default_description");
  const defaultKeywords = t("seo.default_keywords");
  const baseUrl = resolveSiteUrl("/");

  const fullTitle = title ? `${title} | Northern Step Studio` : defaultTitle;
  const finalDescription = description || defaultDescription;
  const finalKeywords = keywords || defaultKeywords;
  const finalCanonicalUrl = resolveSiteUrl(canonicalUrl || baseUrl);
  const finalOgImage = resolveSiteUrl(ogImage || BRAND_ASSETS.studioLogo);

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={finalCanonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={finalCanonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalOgImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={finalCanonicalUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={finalDescription} />
      <meta property="twitter:image" content={finalOgImage} />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}
