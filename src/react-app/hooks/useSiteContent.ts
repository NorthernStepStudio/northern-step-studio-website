import { useState, useEffect } from "react";

export function useSiteContent(key: string) {
  const [content, setContent] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchContent() {
      try {
        const res = await fetch(`/api/site-content/${key}`);
        if (res.ok) {
          const data = await res.json();
          setContent(data.content);
          setUpdatedAt(data.updated_at || data.updatedAt);
        } else if (res.status === 404) {
          setContent(null);
          setUpdatedAt(null);
        } else {
          throw new Error(`Failed to fetch content for key: ${key}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    }

    fetchContent();
  }, [key]);

  return { content, loading, error, updatedAt };
}
