#!/usr/bin/env node
/**
 * Start Metro if it is not already up, then launch the dev build on a paired
 * iPhone pointed at it.
 *
 * Exists because the manual version has three steps that each fail quietly.
 * Metro is suspended when the lid closes and the Mac's LAN address can change
 * between networks, so the URL the dev client remembers goes stale — and the
 * dev client reports a stale URL as "app not found" rather than as a
 * connection problem, which sends you looking in the wrong place.
 *
 * The address is resolved fresh on every run rather than written down.
 *
 * Usage:  npm run dev:phone            (auto-detect the one paired device)
 *         npm run dev:phone -- --udid 00008140-...
 */

import { execSync, spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const PORT = 8081;
const METRO_BOOT_TIMEOUT_MS = 90_000;

function sh(command) {
  return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
}

function tryS(command) {
  try {
    return sh(command);
  } catch {
    return '';
  }
}

/**
 * The Wi-Fi address, not `localhost` — the phone has to reach this machine.
 * Falls back through the common interfaces because en0 is Ethernet on some
 * Macs and Wi-Fi on others.
 */
function lanAddress() {
  for (const nic of ['en0', 'en1', 'en2']) {
    const ip = tryS(`ipconfig getifaddr ${nic}`);
    if (ip) return ip;
  }
  return '';
}

function metroIsUp(host) {
  const body = tryS(`curl -s -m 3 http://${host}:${PORT}/status`);
  return body.includes('packager-status:running');
}

/** The single paired device, or the one whose UDID was passed. */
function resolveDevice(requested) {
  if (requested) return requested;

  const raw = tryS('xcrun xctrace list devices');
  const physical = raw
    .split('\n')
    // Simulators are listed in their own section and always carry a dotted
    // runtime version; physical devices show a 24-char hex UDID.
    .map((line) => line.match(/^(.+?)\s+\(([\d.]+)\)\s+\(([0-9A-F]{8}-[0-9A-F]{16})\)\s*$/i))
    .filter(Boolean);

  if (physical.length === 0) {
    throw new Error(
      'No paired iPhone found. Plug it in, unlock it, and trust this Mac.',
    );
  }
  if (physical.length > 1) {
    const names = physical.map((m) => `  ${m[1].trim()}  ${m[3]}`).join('\n');
    throw new Error(`More than one device is paired — pass one:\n${names}`);
  }
  console.log(`device   ${physical[0][1].trim()}`);
  return physical[0][3];
}

const requestedUdid = process.argv.includes('--udid')
  ? process.argv[process.argv.indexOf('--udid') + 1]
  : undefined;

const host = lanAddress();
if (!host) {
  console.error('No Wi-Fi address. Connect to a network and try again.');
  process.exit(1);
}

const udid = resolveDevice(requestedUdid);

if (metroIsUp(host)) {
  console.log(`metro    already running on ${host}:${PORT}`);
} else {
  console.log(`metro    starting on ${host}:${PORT}`);
  // Detached and inheriting stdio: the point is to leave a server running
  // after this script exits, with its logs still visible in the terminal.
  spawn('npx', ['expo', 'start', '--dev-client'], {
    stdio: 'inherit',
    detached: true,
  }).unref();

  const deadline = Date.now() + METRO_BOOT_TIMEOUT_MS;
  while (!metroIsUp(host)) {
    if (Date.now() > deadline) {
      console.error(`Metro did not come up within ${METRO_BOOT_TIMEOUT_MS / 1000}s.`);
      process.exit(1);
    }
    await sleep(1500);
  }
  console.log('metro    up');
}

const deepLink = `ca.concordia.app://expo-development-client/?url=${encodeURIComponent(
  `http://${host}:${PORT}`,
)}`;

try {
  sh(
    `xcrun devicectl device process launch --device ${udid} ` +
      `--payload-url "${deepLink}" ca.concordia.app`,
  );
  console.log(`launched pointed at ${host}:${PORT}`);
} catch {
  // The most common cause by far, and the message iOS gives is not obvious.
  console.error(
    '\nLaunch was refused. Usually the developer profile needs trusting:\n' +
      '  Settings › General › VPN & Device Management › Apple Development › Trust\n\n' +
      'Personal-team profiles expire after 7 days. To re-sign:\n' +
      '  npm run build:phone\n',
  );
  process.exit(1);
}
