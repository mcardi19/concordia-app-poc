/** Minimal XML helpers for AEM / maps feeds (no DOM on native). */

export function getTagText(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
  return match?.[1]?.trim() ?? '';
}

export function getMarkerBlocks(xml: string): string[] {
  const matches = xml.match(/<marker[\s\S]*?<\/marker>/gi);
  return matches ?? [];
}

export function getMarkerField(block: string, tag: string): string {
  return getTagText(block, tag);
}

export function extractLinkTexts(htmlFragment: string): string[] {
  const results: string[] = [];
  const regex = /<a[^>]*>([^<]*)<\/a>/gi;
  let match = regex.exec(htmlFragment);
  while (match) {
    const text = match[1]?.trim();
    if (text) results.push(text);
    match = regex.exec(htmlFragment);
  }
  return results;
}

export function getPageBlocks(xml: string): string[] {
  return xml.match(/<page[\s\S]*?<\/page>/gi) ?? [];
}
