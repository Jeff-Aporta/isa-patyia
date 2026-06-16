/** Parser SSE del stream POST /api/conversacion (PatyIA). */

export type PatySseEvent = {
  event: string;
  data: Record<string, unknown>;
};

export async function readPatyiaSseStream(
  response: Response,
  onEvent: (ev: PatySseEvent) => void,
): Promise<Record<string, unknown>> {
  if (!response.ok) {
    let msg = response.statusText;
    try {
      const j = await response.json();
      msg = String(j?.error || j?.message || msg);
    } catch { /* ignore */ }
    throw new Error(msg || `HTTP ${response.status}`);
  }
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Stream no disponible");

  const dec = new TextDecoder();
  let buf = "";
  let lastPayload: Record<string, unknown> = {};

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const blocks = buf.split("\n\n");
    buf = blocks.pop() || "";
    for (const block of blocks) {
      const lines = block.split("\n");
      let event = "message";
      let dataLine = "";
      for (const line of lines) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        else if (line.startsWith("data:")) dataLine += line.slice(5).trim();
      }
      if (!dataLine) continue;
      try {
        const data = JSON.parse(dataLine) as Record<string, unknown>;
        lastPayload = data;
        onEvent({ event, data });
      } catch { /* ignore malformed */ }
    }
  }
  return lastPayload;
}
