/**
 * API endpoints ported from mobile-app-main (Twixl HTML articles).
 */

export const API_CONFIG = {
  sisBaseUrl:
    process.env.EXPO_PUBLIC_SIS_API_URL ?? 'https://prod-dataserv.concordia.ca/SIS/api',
  mobileBannerXmlUrl:
    process.env.EXPO_PUBLIC_MOBILE_BANNER_URL ??
    'https://www.concordia.ca/content/concordia/en/shared-components/_jcr_content/mobile-banner.xml',
  hubSsoUrl:
    process.env.EXPO_PUBLIC_HUB_SSO_URL ??
    'https://hub.concordia.ca/content/hub/en/app-sso.html?app=true',
  shuttleScheduleWebUrl:
    'https://www.concordia.ca/campus-life/transportation/shuttle-bus.html',
} as const;
