import { describe, expect, it } from "vitest";
import { formatMonthReference } from "../../format";

describe("formatMonthReference", () => {
  it("traduz o mes da referencia do CUB", () => {
    expect(formatMonthReference("agosto/2026", "en")).toBe("August/2026");
    expect(formatMonthReference("março/2026", "es")).toBe("marzo/2026");
    expect(formatMonthReference("Setembro / 2026", "en")).toBe("September/2026");
  });

  it("mantem o portugues e qualquer formato desconhecido", () => {
    expect(formatMonthReference("agosto/2026", "pt")).toBe("agosto/2026");
    expect(formatMonthReference("08/2026", "en")).toBe("08/2026");
    expect(formatMonthReference("ref. agosto", "en")).toBe("ref. agosto");
  });
});
