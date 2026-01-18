import { useQuery } from '@tanstack/react-query';

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  author: string;
  date: string;
  read_time: number;
  tags: string[];
  created_at: string;
  updated_at: string;
  slug?: string;
}

export interface BlogsResponse {
  posts: BlogPost[];
  total: number;
  page: number;
  pages: number;
  limit: number;
  hasMore: boolean;
}

interface UseBlogsParams {
  page?: number;
  limit?: number;
  tags?: string;
  search?: string;
}

const API_URL = 'https://honnylove.ru/api';

// Fallback tags if API fails
const FALLBACK_TAGS = [
  "Домашняя одежда и уют",
  "Здоровье и добавки",
  "Красота и макияж",
  "Новинки и обзоры",
  "Советы экспертов",
  "Уход за волосами",
  "Уход за лицом",
  "Уход за телом"
];

export const useBlogTags = () => {
  return useQuery({
    queryKey: ['blog-tags'],
    queryFn: async (): Promise<string[]> => {
      try {
        const response = await fetch(`${API_URL}/blogs/tags/all`);
        if (!response.ok) throw new Error('Failed to fetch tags');
        return response.json();
      } catch (error) {
        return FALLBACK_TAGS;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    placeholderData: FALLBACK_TAGS,
  });
};

export const useBlogs = ({ page = 1, limit = 6, tags, search }: UseBlogsParams = {}) => {
  return useQuery({
    queryKey: ['blogs', page, limit, tags, search],
    queryFn: async (): Promise<BlogsResponse> => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (tags) {
        params.append('tags', tags);
      }
      if (search) {
        params.append('search', search);
      }
      
      const response = await fetch(`${API_URL}/blogs?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch blogs');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useBlogPost = (id: string) => {
  return useQuery({
    queryKey: ['blog', id],
    queryFn: async (): Promise<BlogPost> => {
      const response = await fetch(`${API_URL}/blogs/${id}`);
      if (!response.ok) throw new Error('Failed to fetch blog post');
      const data = await response.json();
      return data.post || data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};
