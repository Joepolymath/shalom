import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const PERMISSION_HINT =
  "macOS denied automation access. Grant permission under System Settings > Privacy & Security > Automation (and Full Disk Access for reading Messages), then try again.";

function mapError(err: unknown): Error {
  const message = err instanceof Error ? err.message : String(err);
  if (
    /not authorized|not allowed|-1743|-1728|errAEEventNotPermitted|Operation not permitted/i.test(
      message
    )
  ) {
    return new Error(`${PERMISSION_HINT}\n\nDetails: ${message}`);
  }
  return new Error(message);
}

async function run(args: string[]): Promise<string> {
  try {
    const { stdout } = await execFileAsync("osascript", args, {
      maxBuffer: 8 * 1024 * 1024,
      timeout: 30_000,
    });
    return stdout.trim();
  } catch (err) {
    throw mapError(err);
  }
}

export function runAppleScript(
  script: string,
  args: string[] = []
): Promise<string> {
  return run(["-e", script, ...args]);
}

export function runJXA(script: string, args: string[] = []): Promise<string> {
  return run(["-l", "JavaScript", "-e", script, ...args]);
}
