
import { Post, Category, CommunityMessage, MonetizationConfig } from './types.ts';

class RichacksDB {
  private get config() {
    const url = (window as any).process?.env?.SUPABASE_URL || 'https://myarzcnervxevznfrxhc.supabase.co';
    const key = (window as any).process?.env?.SUPABASE_KEY || '';
    return { url, key };
  }

  private async request(path: string, method: string = 'GET', body?: any) {
    const { url, key } = this.config;
    if (!key) return null;

    try {
      const response = await fetch(`${url}/rest/v1/${path}`, {
        method,
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Prefer': method === 'POST' ? 'return=representation' : ''
        },
        body: body ? JSON.stringify(body) : undefined
      });
      
      if (!response.ok) throw new Error('Supabase Sync Error');
      return await response.json();
    } catch (e) {
      return null;
    }
  }

  private async storageGet<T>(key: string, defaultValue: T): Promise<T> {
    const data = localStorage.getItem(`richacks_v3_${key}`);
    return data ? JSON.parse(data) : defaultValue;
  }

  private async storageSet<T>(key: string, value: T): Promise<void> {
    localStorage.setItem(`richacks_v3_${key}`, JSON.stringify(value));
    window.dispatchEvent(new Event('storage'));
  }

  async getPosts(): Promise<Post[]> {
    const remote = await this.request('posts?select=*&order=created_at.desc');
    if (remote && Array.isArray(remote)) return remote;
    return this.storageGet<Post[]>('posts', []);
  }

  async savePost(post: Post): Promise<void> {
    const remote = await this.request('posts', 'POST', post);
    if (!remote) {
      const posts = await this.getPosts();
      const index = posts.findIndex(p => p.id === post.id);
      if (index > -1) posts[index] = post;
      else posts.unshift({ ...post, createdAt: Date.now() });
      await this.storageSet('posts', posts);
    }
  }

  async deletePost(id: string): Promise<void> {
    await this.request(`posts?id=eq.${id}`, 'DELETE');
    const posts = await this.storageGet<Post[]>('posts', []);
    await this.storageSet('posts', posts.filter(p => p.id !== id));
  }

  async getCategories(): Promise<Category[]> {
    const remote = await this.request('categories?select=*');
    if (remote && Array.isArray(remote)) return remote;
    return this.storageGet<Category[]>('categories', [
      { id: '1', name: 'PC', slug: 'pc' },
      { id: '2', name: 'Android', slug: 'android' }
    ]);
  }

  async addCategory(name: string): Promise<void> {
    const cat = { id: Date.now().toString(), name, slug: name.toLowerCase().replace(/\s+/g, '-') };
    const remote = await this.request('categories', 'POST', cat);
    if (!remote) {
      const cats = await this.getCategories();
      cats.push(cat);
      await this.storageSet('categories', cats);
    }
  }

  async deleteCategory(id: string): Promise<void> {
    await this.request(`categories?id=eq.${id}`, 'DELETE');
    const cats = await this.storageGet<Category[]>('categories', []);
    await this.storageSet('categories', cats.filter(c => c.id !== id));
  }

  async getMessages(): Promise<CommunityMessage[]> {
    const remote = await this.request('community_messages?select=*&order=created_at.desc');
    if (remote && Array.isArray(remote)) {
      return remote.map(m => ({
        id: m.id,
        user: m.user_name,
        type: m.type,
        message: m.message,
        audioUrl: m.audio_url,
        imageUrl: m.image_url,
        date: new Date(m.created_at).toLocaleString(),
        timestamp: new Date(m.created_at).getTime()
      }));
    }
    return this.storageGet<CommunityMessage[]>('messages', []);
  }

  async saveMessage(msg: CommunityMessage): Promise<void> {
    const payload = {
      id: msg.id,
      user_name: msg.user,
      type: msg.type,
      message: msg.message,
      audio_url: msg.audioUrl,
      image_url: msg.imageUrl
    };
    const remote = await this.request('community_messages', 'POST', payload);
    if (!remote) {
      const messages = await this.getMessages();
      messages.unshift({ ...msg, timestamp: Date.now() });
      await this.storageSet('messages', messages);
    }
  }

  async getConfig(): Promise<{ subs: number; monetization: MonetizationConfig }> {
    const monetization = await this.storageGet<MonetizationConfig>('monetization', {
      moneytizerId: '',
      adsterraScript: '',
      ezoicId: '',
      activeNetwork: 'NONE'
    });
    const subs = await this.storageGet<number>('subs', 28);
    return { subs, monetization };
  }

  async saveConfig(subs: number, monetization: MonetizationConfig): Promise<void> {
    await this.storageSet('subs', subs);
    await this.storageSet('monetization', monetization);
    localStorage.setItem('richacks_manual_subs', subs.toString());
  }
}

export const db = new RichacksDB();
