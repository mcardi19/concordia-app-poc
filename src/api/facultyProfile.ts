/**
 * Faculty profiles, from the same DataServ ProfileAPI the public website uses.
 *
 * Both this and the photo host are unauthenticated and world-readable — the
 * profile pages they back are public — so the app can call them directly
 * rather than proxying through AEM.
 *
 * @see wcms-aem `concordia-core/.../services/profiles/FacultyServiceImpl.java`
 */

import axios from 'axios';

const PROFILE_API_BASE = 'https://prod-dataserv.concordia.ca/ProfileAPI/api';
const WEB_BASE = 'https://www.concordia.ca';

/**
 * `fpid` is a name slug — `marc-lafrance` — not a number. The AEM page takes
 * it as `?fpid=`, and the public URL is the same slug as a path segment.
 */
export type FacultyProfileId = string;

/** Photo sizes the media handler publishes. 192 is the headshot, 512 the hero. */
export type FacultyPhotoSize = 192 | 512;

export type FacultyProfile = {
  fpid: FacultyProfileId;
  firstName: string;
  lastName: string;
  /** "Professor, English" — already includes the department. */
  title: string;
  email: string;
  researchArea: string;
  /** Absolute URL, or null when the profile carries no photo. */
  photoUrl: string | null;
  /** Public page for this person. */
  profileUrl: string;
};

/** Raw shape, trimmed to what is used — the full payload is much larger. */
type FacultyProfileResponse = {
  firstName?: string;
  lastName?: string;
  title?: string;
  email?: string;
  researchArea?: string;
  bioPhotoId?: string;
};

/**
 * The media handler keys on the photo id, not the person, and serves a square
 * headshot. Sizes are fixed — an arbitrary width 404s.
 */
export function facultyPhotoUrl(
  bioPhotoId: string,
  size: FacultyPhotoSize = 192,
): string {
  return `${WEB_BASE}/services/profile/media.${bioPhotoId}.${size}.jpg`;
}

/** The public profile page, for opening in a browser. */
export function facultyProfileUrl(fpid: FacultyProfileId): string {
  return `${WEB_BASE}/faculty/${fpid}.html`;
}

/**
 * Titles can carry several appointments joined by `@@` — "Full Professor,
 * English@@Fellow, School of Irish Studies". Only the first is the teaching
 * appointment, and it is the one worth showing next to a class.
 */
function primaryTitle(title: string | undefined): string {
  return (title ?? '').split('@@')[0].trim();
}

export async function fetchFacultyProfile(
  fpid: FacultyProfileId,
): Promise<FacultyProfile | null> {
  try {
    const { data } = await axios.get<FacultyProfileResponse>(
      `${PROFILE_API_BASE}/Faculty/profile/${encodeURIComponent(fpid)}`,
      { timeout: 15000, headers: { Accept: 'application/json' } },
    );
    if (!data?.lastName) return null;

    return {
      fpid,
      firstName: data.firstName ?? '',
      lastName: data.lastName,
      title: primaryTitle(data.title),
      email: data.email ?? '',
      researchArea: data.researchArea ?? '',
      photoUrl: data.bioPhotoId ? facultyPhotoUrl(data.bioPhotoId) : null,
      profileUrl: facultyProfileUrl(fpid),
    };
  } catch {
    // A missing profile 404s; treat it the same as one without a photo — the
    // class still renders, just without the instructor card.
    return null;
  }
}
