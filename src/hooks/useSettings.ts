import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '@/config/api';

export interface SocialLink {
  url: string;
  icon: string;
  name: string;
}

export interface FooterLink {
  url: string;
  title: string;
}

export interface SiteSettings {
  id: number;
  phone: string;
  email: string;
  description: string;
  social_links: SocialLink[];
  footer_links: FooterLink[];
  created_at: string;
  updated_at: string;
}

const fetchSettings = async (): Promise<SiteSettings> => {
  const response = await fetch(`${API_BASE_URL}/api/settings`);
  if (!response.ok) {
    throw new Error('Failed to fetch settings');
  }
  return response.json();
};

export const useSettings = () => {
  return useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: 2,
  });
};
