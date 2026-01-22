import { RuntimeEnvironment } from "./cli";
import * as exec from "@actions/exec";
import * as io from "@actions/io";
import * as core from "@actions/core";

jest.mock("@actions/exec");
jest.mock("@actions/io");
jest.mock("@actions/core");

describe("RuntimeEnvironment", () => {
  let runtime: RuntimeEnvironment;
  const mockedExec = exec.exec as jest.Mock;
  const mockedWhich = io.which as jest.Mock;
  const mockedInfo = core.info as jest.Mock;

  beforeEach(() => {
    runtime = new RuntimeEnvironment();
    jest.clearAllMocks();
  });

  describe("install", () => {
    it("should skip install if sf CLI is already available", async () => {
      mockedWhich.mockResolvedValue("/usr/local/bin/sf");

      await runtime.install("latest");

      expect(mockedWhich).toHaveBeenCalledWith("sf", false);
      expect(mockedExec).not.toHaveBeenCalled();
      expect(mockedInfo).toHaveBeenCalledWith(
        "⚡ Salesforce CLI detected in environment. skipping install.",
      );
    });

    it("should install sf CLI if not found", async () => {
      mockedWhich.mockResolvedValue(null);
      mockedExec.mockResolvedValue(0);

      await runtime.install("latest");

      expect(mockedWhich).toHaveBeenCalledWith("sf", false);
      expect(mockedExec).toHaveBeenCalledWith("npm", [
        "install",
        "-g",
        "@salesforce/cli@latest",
      ]);
      expect(mockedExec).toHaveBeenCalledWith("sf", ["version"]);
    });

    it("should install specific version when provided", async () => {
      mockedWhich.mockResolvedValue(null);
      mockedExec.mockResolvedValue(0);

      await runtime.install("2.50.0");

      expect(mockedExec).toHaveBeenCalledWith("npm", [
        "install",
        "-g",
        "@salesforce/cli@2.50.0",
      ]);
    });

    it("should install latest version when no version specified", async () => {
      mockedWhich.mockResolvedValue(null);
      mockedExec.mockResolvedValue(0);

      await runtime.install();

      expect(mockedExec).toHaveBeenCalledWith("npm", [
        "install",
        "-g",
        "@salesforce/cli@latest",
      ]);
    });

    it("should throw error on npm install failure", async () => {
      mockedWhich.mockResolvedValue(null);
      mockedExec.mockRejectedValue(new Error("npm install failed"));

      await expect(runtime.install("latest")).rejects.toThrow(
        "Failed to bootstrap runtime. NPM registry might be down.",
      );
    });

    it("should throw error on sf version check failure", async () => {
      mockedWhich.mockResolvedValue(null);
      mockedExec
        .mockResolvedValueOnce(0) // npm install succeeds
        .mockRejectedValueOnce(new Error("sf version failed")); // sf version fails

      await expect(runtime.install("latest")).rejects.toThrow(
        "Failed to bootstrap runtime. NPM registry might be down.",
      );
    });

    it("should call startGroup and endGroup", async () => {
      mockedWhich.mockResolvedValue(null);
      mockedExec.mockResolvedValue(0);
      const mockedStartGroup = core.startGroup as jest.Mock;
      const mockedEndGroup = core.endGroup as jest.Mock;

      await runtime.install("latest");

      expect(mockedStartGroup).toHaveBeenCalledWith(
        "🔧 Bootstrapping GlassOps Runtime",
      );
      expect(mockedEndGroup).toHaveBeenCalled();
    });
  });
});
