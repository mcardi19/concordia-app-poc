#!/usr/bin/env node
/**
 * Regenerates src/data/buildings/catalog.ts from:
 * - concordia.ca/maps/buildings directory (catalog.overrides.ts)
 * - crawled building detail pages (overview, accessibility, venues, services, departments)
 * - campus maps XML (services, departments, amenities — merged with website)
 * - hand-curated overrides in catalog.overrides.ts (library branches, aliases)
 *
 * Usage: node scripts/sync-buildings-catalog.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const require = createRequire(import.meta.url);

const WEBSITE_BASE = 'https://www.concordia.ca/maps/buildings';
const CRAWL_CONCURRENCY = 6;

const AMENITY_LABELS = {
  disability: 'Accessible',
  bank: 'ATM',
  bicycle: 'Bike parking',
  biki: 'Bixi',
  info: 'Info desk',
  parking: 'Parking',
};

const XML_URLS = {
  sgw: 'https://sites.concordia.ca/cq/proxy/maps-sgw.php?action=1',
  loy: 'https://sites.concordia.ca/cq/proxy/maps-loy.php?action=1',
};

const WEBSITE_SECTIONS = new Set([
  'Building overview',
  'Building accessibility',
  'Building access hours',
  'Venues',
  'Departments',
  'Services',
]);

function decodeHtml(value) {
  return String(value ?? '')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractLinks(html) {
  const out = [];
  const re = /<a[^>]*>([^<]*)<\/a>/gi;
  let match = re.exec(html);
  while (match) {
    const text = decodeHtml(match[1]);
    if (text) out.push(text);
    match = re.exec(html);
  }
  return out;
}

function normalizeListKey(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/\s*&\s*/g, ' and ')
    .replace(/\([^)]*\)/g, '')
    .trim();
}

function mergeUniqueLists(...groups) {
  const seen = new Set();
  const next = [];
  groups.flat().forEach((value) => {
    const trimmed = String(value ?? '').trim();
    if (!trimmed) return;
    const key = normalizeListKey(trimmed);
    if (!key || seen.has(key)) return;
    seen.add(key);
    next.push(trimmed);
  });
  return next;
}

function parseBuildingPage(html) {
  const mainMatch = html.match(
    /<div class="content-main parsys">([\s\S]*?)<div class="custom-footer-top/
  );
  const main = mainMatch ? mainMatch[1] : html;
  const parsed = {
    overview: undefined,
    accessibility: [],
    accessHours: [],
    venues: [],
    departments: [],
    services: [],
    imageUrl: undefined,
  };

  const headings = [];
  const h2Re = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
  let match = h2Re.exec(main);
  while (match) {
    headings.push({
      title: decodeHtml(match[1]),
      index: match.index,
      len: match[0].length,
    });
    match = h2Re.exec(main);
  }

  for (let i = 0; i < headings.length; i += 1) {
    const heading = headings[i].title;
    if (!WEBSITE_SECTIONS.has(heading)) continue;

    const start = headings[i].index + headings[i].len;
    const end = i + 1 < headings.length ? headings[i + 1].index : main.length;
    const chunk = main.slice(start, end);
    const listItems = [...chunk.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
      .map((item) => decodeHtml(item[1]))
      .filter(Boolean);

    if (heading === 'Building overview') {
      const paragraphs = [...chunk.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
        .map((item) => decodeHtml(item[1]))
        .filter(Boolean);
      if (paragraphs.length) {
        parsed.overview = paragraphs.join('\n\n');
      }
      continue;
    }

    if (heading === 'Building accessibility') {
      parsed.accessibility = cleanAccessibility(
        listItems.length ? listItems : [decodeHtml(chunk)]
      );
      continue;
    }

    if (heading === 'Building access hours') {
      parsed.accessHours = listItems;
      continue;
    }

    if (heading === 'Venues') {
      parsed.venues = listItems;
      continue;
    }

    if (heading === 'Departments') {
      parsed.departments = listItems;
      continue;
    }

    if (heading === 'Services') {
      parsed.services = listItems;
    }
  }

  const imageMatch = [
    ...main.matchAll(
      /<img[^>]+src="(\/content\/concordia\/en\/maps\/buildings\/[^"]+\.(?:jpg|jpeg|png|webp))"[^>]*class="cq-dd-image\s*"/gi
    ),
  ][0];
  if (imageMatch?.[1]) {
    parsed.imageUrl = `https://www.concordia.ca${imageMatch[1]}`;
  }

  return parsed;
}

function parseXmlMarkers(xml, campusId) {
  const markers = xml.match(/<marker[\s\S]*?<\/marker>/gi) ?? [];
  const byCode = new Map();

  markers.forEach((block) => {
    const code = (block.match(/<label>\s*([^<]+)\s*<\/label>/i) ?? [])[1]?.trim();
    if (!code) return;

    const name = (block.match(/<name>\s*([^<]+)\s*<\/name>/i) ?? [])[1]?.trim() ?? '';
    const servicesHtml = (block.match(/<services>([\s\S]*?)<\/services>/i) ?? [])[1] ?? '';
    const departmentsHtml =
      (block.match(/<departments>([\s\S]*?)<\/departments>/i) ?? [])[1] ?? '';
    const amenHtml = (block.match(/<ammeneties>([\s\S]*?)<\/ammeneties>/i) ?? [])[1] ?? '';

    const amenities = [];
    for (const icon of amenHtml.matchAll(/maki-icon\s+(\w+)/gi)) {
      const label = AMENITY_LABELS[icon[1].toLowerCase()] ?? icon[1];
      if (!amenities.includes(label)) amenities.push(label);
    }

    byCode.set(code.toUpperCase(), {
      campusId,
      code,
      xmlName: name,
      services: extractLinks(servicesHtml),
      departments: extractLinks(departmentsHtml),
      amenities,
    });
  });

  return byCode;
}

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.text();
}

async function crawlBuildingPages(directory) {
  const byKey = new Map();
  let index = 0;

  async function worker() {
    while (index < directory.length) {
      const entry = directory[index];
      index += 1;
      const url = `${WEBSITE_BASE}/${entry.code.toLowerCase()}.html`;
      try {
        const html = await fetchText(url);
        byKey.set(`${entry.campusId}-${entry.code.toUpperCase()}`, parseBuildingPage(html));
      } catch (error) {
        console.warn(`Warning: could not crawl ${url}: ${error.message}`);
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CRAWL_CONCURRENCY, directory.length) }, () => worker())
  );

  return byKey;
}

function quote(value) {
  return `'${String(value)
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r?\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()}'`;
}

function cleanAccessibility(items) {
  return items
    .flatMap((item) =>
      item.split(
        /(?=Accessibility ramp|Accessible entrance|Accessible building|Wheelchair lift)/i
      )
    )
    .map((item) =>
      decodeHtml(item)
        .replace(/Back to top[\s\S]*$/i, '')
        .replace(/&copy;/gi, '')
        .trim()
    )
    .filter(Boolean);
}

function formatStringArray(values, indent) {
  if (!values.length) return '[]';
  if (values.length === 1) return `[${quote(values[0])}]`;
  return `[\n${values.map((v) => `${indent}  ${quote(v)},`).join('\n')}\n${indent}]`;
}

function formatExtra(extra, indent) {
  const keys = Object.keys(extra);
  if (!keys.length) return '';

  const lines = keys.flatMap((key) => {
    const value = extra[key];
    if (Array.isArray(value)) {
      if (!value.length) return [];
      return [`${indent}  ${key}: ${formatStringArray(value, `${indent}  `)},`];
    }
    if (typeof value === 'string') {
      return [`${indent}  ${key}: ${quote(value)},`];
    }
    return [];
  });

  if (!lines.length) return '';
  return `, {\n${lines.join('\n')}\n${indent}}`;
}

function uniqueAliases(...groups) {
  return mergeUniqueLists(...groups);
}

async function main() {
  const overridesPath = path.join(root, 'src/data/buildings/catalog.overrides.ts');
  if (!fs.existsSync(overridesPath)) {
    throw new Error(`Missing ${overridesPath}`);
  }

  const overridesSource = fs.readFileSync(overridesPath, 'utf8');
  const { CATALOG_OVERRIDES, WEBSITE_DIRECTORY } = loadOverridesFromSource(overridesSource);

  console.log(`Crawling ${WEBSITE_DIRECTORY.length} building pages…`);
  const [websiteByKey, sgwXml, loyXml] = await Promise.all([
    crawlBuildingPages(WEBSITE_DIRECTORY),
    fetchText(XML_URLS.sgw),
    fetchText(XML_URLS.loy),
  ]);

  const xmlByKey = new Map(
    [...parseXmlMarkers(sgwXml, 'sgw'), ...parseXmlMarkers(loyXml, 'loy')].map((entry) => [
      `${entry[1].campusId}-${entry[0]}`,
      entry[1],
    ])
  );

  const sgwRows = [];
  const loyRows = [];

  for (const entry of WEBSITE_DIRECTORY) {
    const key = `${entry.campusId}-${entry.code.toUpperCase()}`;
    const xml = xmlByKey.get(key);
    const website = websiteByKey.get(key) ?? {};
    const override = CATALOG_OVERRIDES[key] ?? {};

    const extra = {
      aliases: uniqueAliases(override.aliases, entry.name, entry.code, xml?.xmlName),
      overview: override.overview ?? website.overview?.replace(/\s+/g, ' ').trim(),
      accessibility: override.accessibility ?? website.accessibility,
      accessHours: website.accessHours,
      venues: override.venues ?? website.venues,
      library: override.library,
      services: mergeUniqueLists(override.services, website.services, xml?.services),
      departments: mergeUniqueLists(override.departments, website.departments, xml?.departments),
      amenities: xml?.amenities ?? [],
      imageUrl: website.imageUrl,
    };

    Object.keys(extra).forEach((k) => {
      const value = extra[k];
      if (value == null || (Array.isArray(value) && value.length === 0)) {
        delete extra[k];
      }
    });

    const rowText = `  row(${quote(entry.campusId)}, ${quote(entry.code)}, ${quote(entry.name)}, ${quote(entry.address)}${formatExtra(extra, '  ')})`;

    if (entry.campusId === 'sgw') {
      sgwRows.push(rowText);
    } else {
      loyRows.push(rowText);
    }
  }

  const output = `import type { CampusCode, ServiceSearchResult } from '@/types/campus';
import type { BuildingCatalogRecord } from './types';

const MAPS = 'https://www.concordia.ca/maps/buildings';

function page(code: string): string {
  return \`\${MAPS}/\${code.toLowerCase()}.html\`;
}

function row(
  campusId: CampusCode,
  code: string,
  name: string,
  address: string,
  extra: Partial<BuildingCatalogRecord> = {}
): BuildingCatalogRecord {
  return {
    campusId,
    code,
    name,
    address,
    sourceUrl: page(code),
    aliases: extra.aliases ?? [name, code],
    ...extra,
  };
}

/**
 * Consolidated building database.
 * Generated by \`npm run sync:buildings\` from the website directory,
 * crawled building detail pages, maps XML, and catalog.overrides.ts.
 * Coordinates still come from Open Data \`facilities/buildinglist/\`.
 */
export const BUILDING_CATALOG: BuildingCatalogRecord[] = [
${sgwRows.join(',\n')},

${loyRows.join(',\n')},
];

const catalogByKey = new Map(
  BUILDING_CATALOG.map((record) => [\`\${record.campusId}-\${record.code.toUpperCase()}\`, record])
);

export function getBuildingCatalogRecord(
  campusId: CampusCode,
  code: string
): BuildingCatalogRecord | undefined {
  return catalogByKey.get(\`\${campusId}-\${code.trim().toUpperCase()}\`);
}

/** Flattened services/departments index for campus search. */
export function getCampusServices(campusId: CampusCode): ServiceSearchResult[] {
  const results: ServiceSearchResult[] = [];

  BUILDING_CATALOG.filter((building) => building.campusId === campusId).forEach((building) => {
    (building.services ?? []).forEach((label, index) => {
      results.push({
        id: \`svc-\${campusId}-\${building.code}-\${index}-\${label}\`,
        label,
        buildingName: building.name,
        buildingCode: building.code,
        kind: 'service',
      });
    });
    (building.departments ?? []).forEach((label, index) => {
      results.push({
        id: \`dept-\${campusId}-\${building.code}-\${index}-\${label}\`,
        label,
        buildingName: building.name,
        buildingCode: building.code,
        kind: 'department',
      });
    });
  });

  return results.sort((a, b) =>
    \`\${a.label} - \${a.buildingName}\`.localeCompare(\`\${b.label} - \${b.buildingName}\`)
  );
}
`;

  const outPath = path.join(root, 'src/data/buildings/catalog.ts');
  fs.writeFileSync(outPath, output);
  console.log(`Wrote ${outPath} (${WEBSITE_DIRECTORY.length} buildings)`);
}

function loadOverridesFromSource(source) {
  const js = source
    .replace(/^import .*;\n/gm, '')
    .replace(/^export const /gm, 'const ')
    .replace(/: Record<[\s\S]*?> =/g, ' =')
    .replace(/: Array<[\s\S]*?> =/g, ' =')
    .replace(/\s+as const/g, '');

  const modulePath = path.join(root, '.tmp-catalog-overrides.cjs');
  fs.writeFileSync(
    modulePath,
    `${js}\nmodule.exports = { CATALOG_OVERRIDES, WEBSITE_DIRECTORY };\n`
  );

  return require(modulePath);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
