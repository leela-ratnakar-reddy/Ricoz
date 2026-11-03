import { TALENT_PROFILES } from "@/data/talentProfiles";
import { TalentProfile } from "@/types/talent";

/**
 * Returns true if a talent profile is Curated (top-tier vetted).
 * Evaluates canonical `isCurated` flag, falling back to `featured`.
 */
export function isTalentCurated(talent: TalentProfile): boolean {
  return Boolean(talent.isCurated ?? talent.featured);
}

/**
 * Returns all verified talent profiles with canonical `isCurated` normalized.
 */
export function getCanonicalTalentProfiles(): TalentProfile[] {
  return TALENT_PROFILES.map((t) => ({
    ...t,
    isCurated: isTalentCurated(t),
  }));
}

/**
 * Look up a talent profile by ID.
 */
export function getTalentProfileById(id: string): TalentProfile | undefined {
  const talent = TALENT_PROFILES.find((t) => t.id === id);
  if (!talent) return undefined;
  return {
    ...talent,
    isCurated: isTalentCurated(talent),
  };
}

/**
 * Look up a talent profile by exact name.
 */
export function getTalentProfileByName(name: string): TalentProfile | undefined {
  const talent = TALENT_PROFILES.find((t) => t.name.toLowerCase() === name.toLowerCase());
  if (!talent) return undefined;
  return {
    ...talent,
    isCurated: isTalentCurated(talent),
  };
}

/**
 * Returns the curated showcase specialists (for Homepage, Discover, Showcase).
 */
export function getCuratedShowcaseTalent(): TalentProfile[] {
  return getCanonicalTalentProfiles().filter((t) => t.isCurated);
}
