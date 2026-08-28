/**
 * Field limits mirrored from the `patient.updateProfile` Zod schema. Checking
 * them here means a patient sees a hint instead of a rejected mutation.
 */
export const DISPLAY_NAME_MAX = 80;
export const LOCALE_MIN = 2;
export const LOCALE_MAX = 10;
export const TIMEZONE_MAX = 64;

export type ProfileDraft = {
  displayName: string;
  locale: string;
  timezone: string;
};

export type ProfilePatch = Partial<ProfileDraft>;

/**
 * `locale` and `timezone` are free-text on the server, and asking a patient to
 * type an IANA zone would be a trap. Reading them off the device gives a
 * correct value in one tap.
 */
export function deviceRegionalSettings(): { locale: string; timezone: string } | null {
  try {
    const resolved = new Intl.DateTimeFormat().resolvedOptions();
    if (!resolved.locale || !resolved.timeZone) return null;
    if (resolved.locale.length < LOCALE_MIN || resolved.locale.length > LOCALE_MAX) return null;
    if (resolved.timeZone.length > TIMEZONE_MAX) return null;
    return { locale: resolved.locale, timezone: resolved.timeZone };
  } catch {
    return null;
  }
}

/** The first problem worth showing, or null when the draft is submittable. */
export function validateDraft(draft: ProfileDraft): string | null {
  const displayName = draft.displayName.trim();
  if (displayName.length === 0) {
    return "A display name is required — the clinic can remove it for you if you'd rather have none.";
  }
  if (displayName.length > DISPLAY_NAME_MAX) {
    return `Display name must be ${DISPLAY_NAME_MAX} characters or fewer.`;
  }

  const locale = draft.locale.trim();
  if (locale.length < LOCALE_MIN || locale.length > LOCALE_MAX) {
    return `Language must be between ${LOCALE_MIN} and ${LOCALE_MAX} characters, like "en" or "en-CA".`;
  }

  const timezone = draft.timezone.trim();
  if (timezone.length === 0) return "A time zone is required.";
  if (timezone.length > TIMEZONE_MAX) {
    return `Time zone must be ${TIMEZONE_MAX} characters or fewer.`;
  }

  return null;
}

/**
 * Only changed fields are sent. Every field on the mutation is optional, so an
 * untouched value is left alone rather than rewritten with an identical one.
 */
export function buildPatch(draft: ProfileDraft, saved: ProfileDraft): ProfilePatch {
  const patch: ProfilePatch = {};

  const displayName = draft.displayName.trim();
  if (displayName !== saved.displayName.trim()) patch.displayName = displayName;

  const locale = draft.locale.trim();
  if (locale !== saved.locale.trim()) patch.locale = locale;

  const timezone = draft.timezone.trim();
  if (timezone !== saved.timezone.trim()) patch.timezone = timezone;

  return patch;
}

export function isEmptyPatch(patch: ProfilePatch): boolean {
  return Object.keys(patch).length === 0;
}

/** Turns "en-CA" into something a patient recognises, falling back to the tag. */
export function describeLocale(locale: string): string {
  try {
    const names = new Intl.DisplayNames(undefined, { type: "language" });
    return names.of(locale) ?? locale;
  } catch {
    return locale;
  }
}
