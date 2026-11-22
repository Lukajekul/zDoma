import { describe, expect, it } from "vitest";
import { cleanDavcnaInput, davcnaCheckDigit, davcnaError, isValidDavcna } from "./davcna";

describe("isValidDavcna", () => {
  it("accepts a number with the right check digit", () => {
    expect(isValidDavcna("10000003")).toBe(true);
    expect(isValidDavcna("1000 0003")).toBe(true);
  });

  it("rejects a wrong check digit, wrong length or letters", () => {
    expect(isValidDavcna("10000004")).toBe(false);
    expect(isValidDavcna("1000000")).toBe(false);
    expect(isValidDavcna("1000000a")).toBe(false);
  });

  it("maps remainder 10 to check digit 0 and rejects remainder 11", () => {
    expect(davcnaCheckDigit("1000002")).toBe(0); // sum 12 → 11−1 = 10 → 0
    expect(isValidDavcna("10000020")).toBe(true);
    expect(davcnaCheckDigit("0000000")).toBeNull(); // sum 0 → 11 → invalid
    expect(isValidDavcna("00000000")).toBe(false);
  });
});

describe("cleanDavcnaInput / davcnaError", () => {
  it("keeps only the first 8 digits of pasted text", () => {
    expect(cleanDavcnaInput(" 1000-0003 99")).toBe("10000003");
  });

  it("explains wrong length and wrong check digit, accepts a valid number", () => {
    expect(davcnaError("1000000")).toMatch(/8 števk/);
    expect(davcnaError("123456789")).toMatch(/8 števk/);
    expect(davcnaError("10000004")).toMatch(/napačna/);
    expect(davcnaError("10000003")).toBeUndefined();
  });
});
