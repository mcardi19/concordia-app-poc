#!/usr/bin/env node
/**
 * Regenerates src/data/buildings/catalog.ts from:
 * - concordia.ca/maps/buildings directory (catalog.overrides.ts)
 * - campus maps XML (services, departments, amenities)
 * - hand-curated website detail pages (catalog.overrides.ts)
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

function extractLinks(html) {
  const out = [];
  const re = /<a[^>]*>([^<]*)<\/a>/gi;
  let match = re.exec(html);
  while (match) {
    const text = match[1]
      .replace(/&amp;/g, '&')
      .replace(/&nbsp;/g, ' ')
      .trim();
    if (text) out.push(text);
    match = re.exec(html);
  }
  return out;
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
    for (const match of amenHtml.matchAll(/maki-icon\s+(\w+)/gi)) {
      const label = AMENITY_LABELS[match[1].toLowerCase()] ?? match[1];
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

async function fetchXml(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.text();
}

function quote(value) {
  return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
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
      const escaped = value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      return [`${indent}  ${key}: '${escaped}',`];
    }
    return [];
  });

  if (!lines.length) return '';
  return `, {\n${lines.join('\n')}\n${indent}}`;
}

function uniqueAliases(...groups) {
  const seen = new Set();
  const next = [];
  groups.flat().forEach((value) => {
    const trimmed = String(value ?? '').trim();
    if (!trimmed) return;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    next.push(trimmed);
  });
  return next;
}

async function main() {
  const overridesPath = path.join(root, 'src/data/buildings/catalog.overrides.ts');
  if (!fs.existsSync(overridesPath)) {
    throw new Error(`Missing ${overridesPath}`);
  }

  // Load overrides via ts-node alternative: dynamic import won't work for TS in plain node.
  // Parse constants from the TS source with lightweight regex extraction.
  const overridesSource = fs.readFileSync(overridesPath, 'utf8');
  const { CATALOG_OVERRIDES, WEBSITE_DIRECTORY } = loadOverridesFromSource(overridesSource);

  const [sgwXml, loyXml] = await Promise.all([
    fetchXml(XML_URLS.sgw),
    fetchXml(XML_URLS.loy),
  ]);

  const xmlByKey = new Map([
    ...parseXmlMarkers(sgwXml, 'sgw'),
    ...parseXmlMarkers(loyXml, 'loy'),
  ].map((entry) => [`${entry[1].campusId}-${entry[0]}`, entry[1]]));

  const sgwRows = [];
  const loyRows = [];

  for (const entry of WEBSITE_DIRECTORY) {
    const key = `${entry.campusId}-${entry.code.toUpperCase()}`;
    const xml = xmlByKey.get(key);
    const override = CATALOG_OVERRIDES[key] ?? {};

    const extra = {
      aliases: uniqueAliases(
        override.aliases,
        entry.name,
        entry.code,
        xml?.xmlName
      ),
      overview: override.overview,
      accessibility: override.accessibility,
      venues: override.venues,
      library: override.library,
      services: xml?.services ?? [],
      departments: xml?.departments ?? [],
      amenities: xml?.amenities ?? [],
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
 * Generated by \`npm run sync:buildings\` from website directory + maps XML,
 * merged with hand-curated detail pages in catalog.overrides.ts.
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
