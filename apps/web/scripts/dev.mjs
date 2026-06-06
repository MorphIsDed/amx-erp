import { spawn } from "node:child_process";

const isWindows = process.platform === "win32";

function spawnNextDev() {
  const command = isWindows ? "cmd.exe" : "next";
  const args = isWindows ? ["/c", "next", "dev", "--turbo"] : ["dev", "--turbo"];

  const child = spawn(command, args, {
    stdio: ["inherit", "pipe", "pipe"],
    windowsHide: true,
    env: process.env,
  });

  let combined = "";

  const onData = (chunk, stream) => {
    const text = chunk.toString();
    combined += text;
    stream.write(chunk);
  };

  child.stdout.on("data", (c) => onData(c, process.stdout));
  child.stderr.on("data", (c) => onData(c, process.stderr));

  return { child, getOutput: () => combined };
}

function extractPidFromOutput(output) {
  const match = output.match(/- PID:\s*(\d+)/);
  if (!match) return null;
  return Number.parseInt(match[1], 10);
}

async function killPid(pid) {
  if (!Number.isFinite(pid) || pid <= 0) return false;

  if (isWindows) {
    return new Promise((resolve) => {
      const killer = spawn("taskkill", ["/PID", String(pid), "/T", "/F"], {
        stdio: "inherit",
        windowsHide: true,
      });
      killer.on("exit", (code) => resolve(code === 0));
      killer.on("error", () => resolve(false));
    });
  }

  try {
    process.kill(pid, "SIGTERM");
    return true;
  } catch {
    return false;
  }
}

function wireSignals(child) {
  const forward = (signal) => {
    if (!child.killed) child.kill(signal);
  };

  process.on("SIGINT", () => forward("SIGINT"));
  process.on("SIGTERM", () => forward("SIGTERM"));
}

async function main() {
  // Attempt #1
  let { child, getOutput } = spawnNextDev();
  wireSignals(child);

  let exitCode = await new Promise((resolve) => child.on("exit", resolve));

  if (exitCode === 0) return;

  const output = getOutput();
  const hasAlreadyRunning = output.includes("Another next dev server is already running.");
  const pid = extractPidFromOutput(output);

  if (!hasAlreadyRunning || !pid) {
    process.exitCode = exitCode ?? 1;
    return;
  }

  const killed = await killPid(pid);
  if (!killed) {
    process.stderr.write(
      `\\nFailed to stop existing Next dev server (PID ${pid}). Try: taskkill /PID ${pid} /T /F\\n`,
    );
    process.exitCode = exitCode ?? 1;
    return;
  }

  // Attempt #2
  ({ child } = spawnNextDev());
  wireSignals(child);
  exitCode = await new Promise((resolve) => child.on("exit", resolve));
  process.exitCode = exitCode ?? 1;
}

await main();
