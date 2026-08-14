import axios from 'axios';
import { API_CONFIG } from '@/config/api';
import { getCampusServices } from '@/data/buildings';
import type { CampusCode, FeaturedEvent, ServiceSearchResult } from '@/types/campus';
import {
  getPageBlocks,
  getTagText,
} from '@/utils/xml';

async function fetchXml(url: string): Promise<string> {
  const { data } = await axios.get<string>(url, {
    timeout: 20000,
    responseType: 'text',
    transformResponse: [(r) => r],
  });
  return data;
}

export async function fetchCampusServices(campus: CampusCode): Promise<ServiceSearchResult[]> {
  return getCampusServices(campus);
}

export function filterServices(
  items: ServiceSearchResult[],
  query: string
): ServiceSearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return items.slice(0, 50);
  return items
    .filter(
      (item) =>
        item.label.toLowerCase().includes(q) || item.buildingName.toLowerCase().includes(q)
    )
    .slice(0, 100);
}

/** Featured content from AEM mobile banner XML (legacy landing dynamic banner). */
export async function fetchFeaturedEvents(): Promise<FeaturedEvent[]> {
  const xml = await fetchXml(API_CONFIG.mobileBannerXmlUrl);
  return getPageBlocks(xml).map((block, index) => ({
    id: `event-${index}`,
    title: getTagText(block, 'title').replace(/<br\s*\/?>/gi, ' ').replace(/<\/?p>/gi, ''),
    subtitle: getTagText(block, 'text'),
    url: getTagText(block, 'url') || undefined,
    backgroundColor: getTagText(block, 'bgColor') || '912338',
    textColor: getTagText(block, 'textColor') || 'ffffff',
    imageUrl: getTagText(block, 'bgImage') || undefined,
  }));
}
