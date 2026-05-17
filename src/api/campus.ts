import axios from 'axios';
import { API_CONFIG } from '@/config/api';
import type { CampusCode, FeaturedEvent, ServiceSearchResult } from '@/types/campus';
import {
  extractLinkTexts,
  getMarkerBlocks,
  getMarkerField,
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
  const url =
    campus === 'loy'
      ? `${API_CONFIG.mapsProxyBaseUrl}/maps-loy.php?action=1`
      : `${API_CONFIG.mapsProxyBaseUrl}/maps-sgw.php?action=1`;

  let xml: string;
  try {
    xml = await fetchXml(url);
  } catch {
    xml = await fetchXml(
      campus === 'loy' ? API_CONFIG.buildingsLoyXmlUrl : API_CONFIG.buildingsSgwXmlUrl
    );
  }

  const results: ServiceSearchResult[] = [];
  getMarkerBlocks(xml).forEach((block, index) => {
    const buildingName = getMarkerField(block, 'name');
    const servicesHtml = getMarkerField(block, 'services');
    const departmentsHtml = getMarkerField(block, 'departments');

    extractLinkTexts(servicesHtml).forEach((label) => {
      results.push({
        id: `svc-${campus}-${index}-${label}`,
        label,
        buildingName,
        kind: 'service',
      });
    });
    extractLinkTexts(departmentsHtml).forEach((label) => {
      results.push({
        id: `dept-${campus}-${index}-${label}`,
        label,
        buildingName,
        kind: 'department',
      });
    });
  });

  return results.sort((a, b) =>
    `${a.label} - ${a.buildingName}`.localeCompare(`${b.label} - ${b.buildingName}`)
  );
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
