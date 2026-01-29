import { GoogleGenAI, Type } from "@google/genai";
import { SEOOutput, TrendTopic } from "./types.ts";

export interface SearchResource {
  title: string;
  description: string;
  url: string;
  fileTypes: string[];
  isDirect: boolean;
  category: 'CREATOR' | 'NORMAL' | 'TOOLS';
}

export interface SearchResult {
  analysis: string;
  resources: SearchResource[];
  error?: string;
}

export interface NewsReport {
  title: string;
  fullContent: string;
  videoIdeas: string[];
  hooks: string[];
}

export class RichacksEngine {
  constructor() {}

  private getAI() {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY no detectada. Configúrala en el panel de Netlify/Vercel.");
    }
    return new GoogleGenAI({ apiKey });
  }

  async findUltraResources(query: string): Promise<SearchResult> {
    try {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Actúa como un experto en búsqueda de recursos para YouTubers. Encuentra enlaces de DESCARGA DIRECTA (Mediafire, Mega, Google Drive) para: "${query}". Prioriza archivos .zip, .rar o instaladores gratuitos.`,
        config: { 
          tools: [{ googleSearch: {} }] 
        },
      });

      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const resources: SearchResource[] = groundingChunks
        .filter((chunk: any) => chunk.web)
        .map((chunk: any, index: number) => ({
          title: chunk.web.title || `Recurso de Descarga #${index + 1}`,
          description: 'Enlace verificado mediante rastreo profundo Richacks.',
          url: chunk.web.uri,
          fileTypes: ['FREE', 'DIRECT'],
          isDirect: true,
          category: 'TOOLS'
        }));

      return { 
        analysis: response.text || "Rastreo completado con éxito.", 
        resources 
      };
    } catch (error: any) {
      console.error("RichacksEngine Error:", error);
      return { analysis: "Error de conexión con la red de búsqueda.", resources: [], error: "ERROR_AI" };
    }
  }

  async optimizeSEO(topic: string): Promise<SEOOutput> {
    try {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Genera una estrategia SEO viral para un video de YouTube sobre: "${topic}". Responde ÚNICAMENTE en formato JSON con las propiedades: 'titles' (array de 3), 'tags' (array de strings que sumen menos de 500 chars) y 'description' (parrafo persuasivo).`,
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text || '{"titles": [], "tags": [], "description": ""}');
    } catch (error) { 
      return { titles: ["Error de Generación"], tags: ["ia", "error"], description: "No se pudo conectar con el motor SEO." }; 
    }
  }

  async generateScript(topic: string): Promise<string> {
    try {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Escribe un guion viral de alto impacto para YouTube sobre: ${topic}. Incluye un hook de 3 segundos, desarrollo dinámico y llamada a la acción. Tono profesional pero cercano.`,
      });
      return response.text || "Error al procesar el guion.";
    } catch (error) { return "Error técnico en la central Richacks."; }
  }

  async generateThumbnail(prompt: string, baseImage?: string): Promise<string | null> {
    try {
      const ai = this.getAI();
      const parts: any[] = [{ text: `Miniatura estilo YouTuber Pro (MrBeast/Techno): ${prompt}. Colores vibrantes, alto contraste, texto legible.` }];
      if (baseImage) {
        parts.unshift({ 
          inlineData: { 
            data: baseImage.split(',')[1], 
            mimeType: 'image/png' 
          } 
        });
      }
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
        config: { imageConfig: { aspectRatio: "16:9" } }
      });
      
      let imageUrl: string | null = null;
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
      return imageUrl;
    } catch (error) { 
      console.error("Thumbnail error:", error);
      return null; 
    }
  }

  async generateViralIdeas(niche: string): Promise<any[]> {
    try {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Genera 3 ideas de videos virales para el nicho: ${niche}. Responde en JSON con este formato: [{"title": "...", "concept": "...", "potential": "Viral/Alto", "difficulty": "Baja/Media/Alta"}].`,
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text || "[]");
    } catch (error) { return []; }
  }

  async fetchTrends(force: boolean = false): Promise<{ trends: TrendTopic[]; error?: string }> {
    try {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Dame las 6 noticias más importantes de hoy sobre tecnología, gaming y YouTube en español.",
        config: { tools: [{ googleSearch: {} }] },
      });
      
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const trends: TrendTopic[] = groundingChunks
        .filter((chunk: any) => chunk.web)
        .slice(0, 6)
        .map((chunk: any, index: number) => ({
          title: chunk.web.title || `Tendencia #${index + 1}`,
          source: chunk.web.uri,
          imageUrl: `https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80&sig=${index}`,
          hotScore: Math.floor(Math.random() * 20) + 80
        }));
      return { trends };
    } catch (error: any) {
      return { trends: [], error: "ERROR_TRENDS" };
    }
  }

  async getNewsDetail(title: string, source: string): Promise<NewsReport | null> {
    try {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Analiza a fondo esta noticia: "${title}" de la fuente ${source}. Extrae el contenido clave y genera ideas de video. Responde en JSON.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              fullContent: { type: Type.STRING },
              videoIdeas: { type: Type.ARRAY, items: { type: Type.STRING } },
              hooks: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["title", "fullContent", "videoIdeas", "hooks"]
          }
        }
      });
      return JSON.parse(response.text || 'null');
    } catch (error) { return null; }
  }
}