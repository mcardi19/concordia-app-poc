#!/usr/bin/env bash
#
# Re-sign and install the dev build on a paired iPhone.
#
# Needed roughly weekly: a personal-team provisioning profile is valid for 7
# days, after which the installed app stops launching with "invalid code
# signature ... or its profile has not been explicitly trusted".
#
# Goes straight to xcodebuild rather than through `expo run:ios` for two
# reasons. Expo's CLI does not pass `-allowProvisioningUpdates`, without which
# xcodebuild treats automatic signing as disabled and fails with "No profiles
# for 'ca.concordia.app' were found" even though the project is set to
# Automatic. And the SDK 54 CLI warns "Unexpected devicectl JSON version
# output" against Xcode 26, so its device handling is not dependable here.
#
# Usage:  npm run build:phone
#         npm run build:phone -- 00008140-...      (explicit UDID)

set -euo pipefail

cd "$(dirname "$0")/.."

TEAM="WP674ZSSXH"
BUNDLE_ID="ca.concordia.app"

UDID="${1:-}"
if [ -z "$UDID" ]; then
  UDID=$(xcrun xctrace list devices 2>/dev/null \
    | grep -iE '\([0-9A-F]{8}-[0-9A-F]{16}\)' \
    | head -1 \
    | sed -E 's/.*\(([0-9A-F]{8}-[0-9A-F]{16})\).*/\1/')
fi

if [ -z "$UDID" ]; then
  echo "No paired iPhone found. Plug it in, unlock it, and trust this Mac." >&2
  exit 1
fi

echo "device   $UDID"
echo "building — first run takes several minutes"

xcodebuild \
  -workspace ios/Concordia.xcworkspace \
  -scheme Concordia \
  -configuration Debug \
  -destination "id=$UDID" \
  -allowProvisioningUpdates \
  DEVELOPMENT_TEAM="$TEAM" \
  build \
  | tail -20

APP=$(find ~/Library/Developer/Xcode/DerivedData/Concordia-*/Build/Products/Debug-iphoneos \
  -maxdepth 1 -name 'Concordia.app' 2>/dev/null | head -1)

if [ -z "$APP" ]; then
  echo "Build finished but no .app was produced." >&2
  exit 1
fi

echo "installing $APP"
xcrun devicectl device install app --device "$UDID" "$APP" >/dev/null

cat <<EOF

Installed. If this was a fresh profile, trust it once on the phone:
  Settings › General › VPN & Device Management › Apple Development › Trust

Then:  npm run dev:phone
EOF
