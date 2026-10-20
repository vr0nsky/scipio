import { describe, expect, it } from "vitest";
import { getRequestedCountry, getScrapeLocale } from "./locale";

describe("getScrapeLocale", () => {
	it("tracks a US, English audience when nothing is configured", () => {
		expect(getScrapeLocale({})).toEqual({ country: "US", language: "en" });
		expect(getScrapeLocale({ ELMO_COUNTRY: "", ELMO_LANGUAGE: "  " })).toEqual({ country: "US", language: "en" });
	});

	it("reads the configured country and language, whatever their case", () => {
		expect(getScrapeLocale({ ELMO_COUNTRY: " it ", ELMO_LANGUAGE: "IT" })).toEqual({ country: "IT", language: "it" });
	});

	it("rejects a country that is not an ISO 3166-1 alpha-2 code rather than tracking the wrong market", () => {
		expect(() => getScrapeLocale({ ELMO_COUNTRY: "ITA" })).toThrow(/ELMO_COUNTRY/);
		expect(() => getScrapeLocale({ ELMO_COUNTRY: "Italy" })).toThrow(/ELMO_COUNTRY/);
		expect(() => getScrapeLocale({ ELMO_COUNTRY: "XX" })).toThrow(/ELMO_COUNTRY/);
	});

	it("rejects a language that is not an ISO 639-1 code", () => {
		expect(() => getScrapeLocale({ ELMO_LANGUAGE: "ita" })).toThrow(/ELMO_LANGUAGE/);
		expect(() => getScrapeLocale({ ELMO_LANGUAGE: "it-IT" })).toThrow(/ELMO_LANGUAGE/);
	});
});

describe("getRequestedCountry", () => {
	it("is unset unless ELMO_COUNTRY is, so providers that never sent a location still don't", () => {
		expect(getRequestedCountry({})).toBeUndefined();
		expect(getRequestedCountry({ ELMO_LANGUAGE: "it" })).toBeUndefined();
		expect(getRequestedCountry({ ELMO_COUNTRY: "it" })).toBe("IT");
	});
});
