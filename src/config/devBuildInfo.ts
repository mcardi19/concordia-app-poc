/**
 * Git identity baked into `expo.extra` at Metro / config start
 * (`app.config.js`). Used by the __DEV__ branch badge on device.
 */

import Constants from 'expo-constants';

type DevBuildExtra = {
  gitBranch?: string;
  gitCommit?: string;
};

export type DevBuildInfo = {
  branch: string;
  commit: string;
};

export function getDevBuildInfo(): DevBuildInfo | null {
  const extra = Constants.expoConfig?.extra as DevBuildExtra | undefined;
  const branch = extra?.gitBranch?.trim();
  const commit = extra?.gitCommit?.trim();
  if (!branch && !commit) return null;
  return {
    branch: branch || 'unknown',
    commit: commit || '???????',
  };
}
