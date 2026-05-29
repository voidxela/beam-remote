// src/network/ecp.ts

export const RokuKeys = {
  HOME: "Home",
  PLAY: "Play",
  SELECT: "Select",
  LEFT: "Left",
  RIGHT: "Right",
  UP: "Up",
  DOWN: "Down",
  BACK: "Back",
} as const;

export type RokuKey = (typeof RokuKeys)[keyof typeof RokuKeys];

let requestCounter = 0;

/**
 * Sends an ECP keypress command to the Roku with advanced latency tracing.
 */
export const sendKeypress = async (
  ip: string,
  key: RokuKey,
): Promise<boolean> => {
  const reqId = ++requestCounter;
  const url = `http://${ip}:8060/keypress/${key}`;

  console.log(`[TRACE][#${reqId}] ⏳ Initiating: ${key}`);
  const startTime = performance.now();

  try {
    const response = await fetch(url, {
      method: "POST",
      // Relying on native OS keep-alive pooling
    });

    const ttfbTime = performance.now();
    const ttfb = (ttfbTime - startTime).toFixed(2);

    // Await the empty text response to ensure the OS network layer fully drains
    await response.text();

    const endTime = performance.now();
    const totalLatency = (endTime - startTime).toFixed(2);
    const drainTime = (endTime - ttfbTime).toFixed(2);

    if (response.ok) {
      console.log(
        `[TRACE][#${reqId}] ✅ ${key} | Total: ${totalLatency}ms | TTFB: ${ttfb}ms | Drain: ${drainTime}ms`,
      );
      return true;
    } else {
      console.warn(
        `[TRACE][#${reqId}] ⚠️ ${key} | Status: ${response.status} | Total: ${totalLatency}ms`,
      );
      return false;
    }
  } catch (error) {
    const endTime = performance.now();
    const totalLatency = (endTime - startTime).toFixed(2);

    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(
      `[TRACE][#${reqId}] ❌ ${key} | FAILED | Total: ${totalLatency}ms | Error: ${errorMessage}`,
    );
    return false;
  }
};
