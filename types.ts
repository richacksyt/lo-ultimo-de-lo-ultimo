
export enum ToolType {
  DASHBOARD = 'DASHBOARD',
  INTELLIGENCE = 'INTELLIGENCE', 
  DOWNLOADER = 'DOWNLOADER',
  ADMIN = 'ADMIN',
  TUTORIALS = 'TUTORIALS',
  COMMUNITY = 'COMMUNITY',
  CONTACT = 'CONTACT',
  PRIVACY = 'PRIVACY',
  TERMS = 'TERMS',
  VIRAL_HITS = 'VIRAL_HITS',
  TRENDING = 'TRENDING'
}

export enum SubToolType {
  SCRIPTS = 'SCRIPTS',
  SEO = 'SEO',
  IDEAS = 'IDEAS',
  THUMBNAILS = 'THUMBNAILS'
}

export interface Post {
  id: string;
  title: string;
  videoUrl?: string; 
  description: string;
  downloadUrl?: string; 
  category: string;
  mainImage?: string;
  miniImage?: string;
  date: string;
  createdAt?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface CommunityMessage {
  id: string;
  user: string;
  type: 'ERROR' | 'COLAB' | 'REQUEST';
  message: string;
  audioUrl?: string;
  imageUrl?: string;
  date: string;
  timestamp: number;
}

export interface MonetizationConfig {
  moneytizerId: string;
  adsterraScript: string;
  ezoicId: string;
  activeNetwork: 'NONE' | 'MONEYTIZER' | 'ADSTERRA' | 'EZOIC' | 'MIXED';
}

export interface SEOOutput {
  titles: string[];
  tags: string[];
  description: string;
}

export interface TrendTopic {
  title: string;
  source: string;
  imageUrl: string;
  hotScore: number;
}
