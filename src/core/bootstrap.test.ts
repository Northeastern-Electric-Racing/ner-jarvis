import { expect, test } from "bun:test";
import { delimiter } from "node:path";
import { INSTALL_PS1, INSTALL_SH, installerCommand, prependPath } from "./bootstrap";

test("installerCommand: official one-liner per platform", () => {
  expect(installerCommand("darwin")).toEqual({ bin: "bash", args: ["-c", `curl -fsSL ${INSTALL_SH} | bash`], display: `curl -fsSL ${INSTALL_SH} | bash` });
  expect(installerCommand("linux").bin).toBe("bash");
  const win = installerCommand("win32");
  expect(win.bin).toBe("powershell");
  expect(win.args.at(-1)).toBe(`irm ${INSTALL_PS1} | iex`);
});

test("prependPath: prepends once, and honors Windows' `Path` key", () => {
  const env: NodeJS.ProcessEnv = { PATH: ["/usr/bin", "/bin"].join(delimiter) };
  prependPath("/home/u/.local/bin", env);
  prependPath("/home/u/.local/bin", env);
  expect(env.PATH).toBe(["/home/u/.local/bin", "/usr/bin", "/bin"].join(delimiter));

  const win: NodeJS.ProcessEnv = { Path: "C:\\Windows" };
  prependPath("C:\\Users\\u\\.local\\bin", win);
  expect(Object.keys(win)).toEqual(["Path"]);
  expect(win.Path!.startsWith("C:\\Users\\u\\.local\\bin")).toBe(true);
});
