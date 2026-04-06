export interface ProgressItem {
  text: string;
  completed: boolean;
}

export interface AppData {
  id: number;
  uuid?: string | null;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  fullDescription?: string;
  category: string;
  status: string;
  statusLabel: string;
  targetDate: string | null;
  techStack: string[];
  progress: ProgressItem[];
  logo: string | null;
  screenshots: string[];
  cta_url: string | null;
  video_url: string | null;
  features: string[];
  platform: string;
  visibility: string;
  progressPercent: number;
  monetization: string;
}
