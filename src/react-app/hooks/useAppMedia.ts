import { useEffect, useState } from "react";

export interface AppMedia {
  id: number;
  app_uuid: string;
  url: string;
  media_type: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function useAppMedia(appSlugOrUuid: string) {
  const [media, setMedia] = useState<AppMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!appSlugOrUuid) {
      setIsLoading(false);
      return;
    }

    const fetchMedia = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/apps/${appSlugOrUuid}/media`);
        if (!response.ok) throw new Error("Failed to fetch media");
        const data = await response.json();
        setMedia(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setMedia([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedia();
  }, [appSlugOrUuid]);

  return { media, isLoading, error };
}
