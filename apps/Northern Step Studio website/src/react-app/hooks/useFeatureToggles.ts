import { useState, useEffect } from "react";

interface FeatureToggle {
  id: number;
  feature_key: string;
  feature_name: string;
  is_enabled: boolean;
  description: string;
}

export function useFeatureToggles() {
  const [features, setFeatures] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeatures();
  }, []);

  const loadFeatures = async () => {
    try {
      const res = await fetch("/api/feature-toggles");
      const data: FeatureToggle[] = await res.json();
      
      // Convert to key-value map for easy lookup
      const featureMap: Record<string, boolean> = {};
      data.forEach((f) => {
        featureMap[f.feature_key] = !!f.is_enabled;
      });
      
      setFeatures(featureMap);
    } catch (err) {
      console.error("Failed to load feature toggles:", err);
    } finally {
      setLoading(false);
    }
  };

  const isEnabled = (key: string): boolean => {
    return features[key] !== false;
  };

  return { features, isEnabled, loading };
}
