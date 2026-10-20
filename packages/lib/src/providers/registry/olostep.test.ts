import { afterEach, describe, expect, it, vi } from "vitest";

const olostepClient = vi.hoisted(() => ({ createBatch: vi.fn() }));

vi.mock("olostep", () => ({
	default: class {
		batches = { create: olostepClient.createBatch };
	},
}));

import { olostep } from "./olostep";

afterEach(() => {
	vi.clearAllMocks();
	vi.unstubAllEnvs();
});

async function requestedBatch(model: string) {
	vi.stubEnv("OLOSTEP_API_KEY", "test-key");
	olostepClient.createBatch.mockRejectedValue(new Error("stop here"));
	await expect(olostep.run(model, "migliori casse", { webSearch: true })).rejects.toThrow("stop here");
	const [items, options] = olostepClient.createBatch.mock.calls[0];
	return { url: new URL(items[0].url), options };
}

describe("olostep localization", () => {
	it("runs the batch from the configured country", async () => {
		vi.stubEnv("ELMO_COUNTRY", "IT");
		const { options } = await requestedBatch("chatgpt");
		expect(options).toMatchObject({ parser: { id: "@olostep/chatgpt-results" }, country: "IT" });
	});

	it("asks Google pages in the configured country and language", async () => {
		vi.stubEnv("ELMO_COUNTRY", "IT");
		vi.stubEnv("ELMO_LANGUAGE", "it");
		const { url } = await requestedBatch("google-ai-overview");
		expect(url.searchParams.get("q")).toBe("migliori casse");
		expect(url.searchParams.get("gl")).toBe("it");
		expect(url.searchParams.get("hl")).toBe("it");
	});

	it("requests exactly what it always did when nothing is configured", async () => {
		const { url, options } = await requestedBatch("google-ai-mode");
		expect(url.toString()).toBe("https://google.com/aimode?q=migliori%20casse");
		expect(options).toEqual({ parser: { id: "@olostep/google-aimode-results" } });
	});
});
