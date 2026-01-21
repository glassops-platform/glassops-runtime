import { ProtocolPolicy } from "./policy";
import * as core from "@actions/core";
import * as fs from "fs";

// Partial Mock: Keeps fs.promises intact for @actions/core
jest.mock("fs", () => ({
  ...jest.requireActual("fs"),
  existsSync: jest.fn(),
}));

jest.mock("@actions/core");

describe("ProtocolPolicy", () => {
  let policy: ProtocolPolicy;
  const mockedExistsSync = fs.existsSync as jest.Mock;

  beforeEach(() => {
    policy = new ProtocolPolicy();
    jest.clearAllMocks();
  });

  describe("checkFreeze", () => {
    const mockConfig = {
      governance: {
        enabled: true,
        freeze_windows: [
          {
            day: "Friday",
            start: "09:00",
            end: "17:00",
          },
        ],
      },
      runtime: { cli_version: "latest", node_version: "20" },
    };

    it("should throw an error if the current time is within a freeze window", () => {
      // Jan 23, 2026 is a Friday
      // 10:00:00Z is within the 09:00-17:00 window
      const mockDate = new Date("2026-01-23T10:00:00Z");
      jest.useFakeTimers().setSystemTime(mockDate);

      expect(() => policy.checkFreeze(mockConfig as any)).toThrow(/FROZEN/);
    });

    it("should allow deployment if the current time is outside freeze windows", () => {
      // Jan 23, 2026 at 18:00:00Z (6:00 PM) is outside the 5:00 PM cutoff
      const mockDate = new Date("2026-01-23T18:00:00Z");
      jest.useFakeTimers().setSystemTime(mockDate);

      expect(() => policy.checkFreeze(mockConfig as any)).not.toThrow();
    });
  });

  describe("load", () => {
    it("should return a default unsafe policy if devops-config.json is missing", async () => {
      mockedExistsSync.mockReturnValue(false);

      const config = await policy.load();

      expect(config.governance.enabled).toBe(false);
      expect(core.warning).toHaveBeenCalledWith(
        expect.stringContaining("Using default unsafe policy"),
      );
    });
  });
});
