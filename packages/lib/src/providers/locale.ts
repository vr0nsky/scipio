/**
 * The audience every tracked run is asked on behalf of. Answer engines tailor
 * their answer, sources and shops to the asker's country, so a deployment
 * tracking an Italian market has to look Italian to every provider.
 */
export interface ScrapeLocale {
	/** ISO 3166-1 alpha-2, upper-case (e.g. "IT"). */
	country: string;
	/** ISO 639-1, lower-case (e.g. "it"). */
	language: string;
}

export const DEFAULT_SCRAPE_LOCALE: ScrapeLocale = { country: "US", language: "en" };

// `fallback: "none"` makes a code ICU doesn't know come back undefined instead
// of echoed, so a well-formed but meaningless value ("XX") is rejected too.
const regionNames = new Intl.DisplayNames(["en"], { type: "region", fallback: "none" });
const languageNames = new Intl.DisplayNames(["en"], { type: "language", fallback: "none" });

/**
 * Reads ELMO_COUNTRY and ELMO_LANGUAGE. A malformed value throws rather than
 * falling back: silently tracking the US market for a deployment that asked
 * for another would produce plausible-looking but wrong data.
 */
export function getScrapeLocale(env: Record<string, string | undefined> = process.env): ScrapeLocale {
	const country = env.ELMO_COUNTRY?.trim().toUpperCase() || DEFAULT_SCRAPE_LOCALE.country;
	const language = env.ELMO_LANGUAGE?.trim().toLowerCase() || DEFAULT_SCRAPE_LOCALE.language;

	if (!/^[A-Z]{2}$/.test(country) || !regionNames.of(country)) {
		throw new Error(`ELMO_COUNTRY must be an ISO 3166-1 alpha-2 country code such as "IT" (got "${env.ELMO_COUNTRY}")`);
	}
	if (!/^[a-z]{2}$/.test(language) || !languageNames.of(language)) {
		throw new Error(`ELMO_LANGUAGE must be an ISO 639-1 language code such as "it" (got "${env.ELMO_LANGUAGE}")`);
	}
	return { country, language };
}

/**
 * The country only when ELMO_COUNTRY is set. For providers that sent no
 * location at all before it existed: leaving it unset keeps their requests
 * exactly as they were, rather than pinning them to the US default.
 */
export function getRequestedCountry(env: Record<string, string | undefined> = process.env): string | undefined {
	return env.ELMO_COUNTRY?.trim() ? getScrapeLocale(env).country : undefined;
}

/** The language only when ELMO_LANGUAGE is set; see getRequestedCountry. */
export function getRequestedLanguage(env: Record<string, string | undefined> = process.env): string | undefined {
	return env.ELMO_LANGUAGE?.trim() ? getScrapeLocale(env).language : undefined;
}
