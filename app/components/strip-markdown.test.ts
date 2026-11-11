import { describe, expect, it } from "vitest";

import { stripMarkdown } from "./strip-markdown";

describe("stripMarkdown", () => {
  it("removes bold markers the model emits out of habit", () => {
    expect(stripMarkdown("integrates **Anthropic Claude** via its SDK")).toBe(
      "integrates Anthropic Claude via its SDK",
    );
  });

  it("removes italics and bold-italics", () => {
    expect(stripMarkdown("a *six week* delivery with ***real*** urgency")).toBe(
      "a six week delivery with real urgency",
    );
  });

  it("leaves arithmetic alone", () => {
    expect(stripMarkdown("2 * 3 = 6 and 4 * 5 = 20")).toBe("2 * 3 = 6 and 4 * 5 = 20");
  });

  it("leaves ordinary prose untouched", () => {
    const prose = "I delivered a compliance system in six weeks with 2.5 developers.";
    expect(stripMarkdown(prose)).toBe(prose);
  });

  it("strips headings and bullet markers", () => {
    expect(stripMarkdown("## Experience\n- C# and .NET\n- Azure")).toBe(
      "Experience\nC# and .NET\nAzure",
    );
  });

  it("keeps underscores inside identifiers", () => {
    expect(stripMarkdown("the max_tokens value")).toBe("the max_tokens value");
  });
});
