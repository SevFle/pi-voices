/**
 * pi-voices: selectable output voices for the pi coding agent.
 *
 * A voice is a markdown file. Its body is appended to the system prompt on every
 * turn while it is active, so the instruction survives compaction.
 *
 * Sources, lowest priority first:
 *   1. voices/ inside this package      stock voices, seeded into the user dir
 *   2. ~/.pi/agent/voices/              your editable copies
 *   3. <cwd>/.pi/voices/                per-repo voices, wins over the rest
 *
 * Selection persists in ~/.pi/agent/voice.json.
 *
 * CLI flags:
 *   --voice <a,b>     use these voices for this process only, nothing is written
 *   --voice-debug     log the injected block size to stderr
 *
 * Environment overrides, mostly useful in tests:
 *   VOICE_DIR, VOICE_STATE, VOICE_PACKAGED_DIR
 */

import { existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import {
  discoverVoices,
  parseVoiceFile,
  readVoiceState,
  seedVoices,
  starterTemplate,
  writeVoiceState,
  type Voice,
} from "../lib/voices.ts";

const HEADER = "## Output voice";
const DEFAULT_ACTIVE = ["unslop"];

function userVoicesDir(): string {
  return process.env.VOICE_DIR ?? join(homedir(), ".pi", "agent", "voices");
}

function stateFile(): string {
  return process.env.VOICE_STATE ?? join(homedir(), ".pi", "agent", "voice.json");
}

function packagedVoicesDir(): string {
  if (process.env.VOICE_PACKAGED_DIR) return process.env.VOICE_PACKAGED_DIR;
  try {
    return resolve(dirname(fileURLToPath(import.meta.url)), "..", "voices");
  } catch {
    return ""; // loader gave us no module URL; packaged defaults are skipped
  }
}

export default function (pi: ExtensionAPI) {
  let voices = new Map<string, Voice>();
  let active: string[] = [];
  let flagOverride: string[] | undefined;
  let cwd = process.cwd();

  const debugOn = () => Boolean(pi.getFlag("voice-debug"));

  function sources() {
    return [
      { dir: packagedVoicesDir(), scope: "packaged" as const },
      { dir: userVoicesDir(), scope: "user" as const },
      { dir: join(cwd, ".pi", "voices"), scope: "project" as const },
    ];
  }

  function rescan() {
    voices = discoverVoices(sources());
  }

  /** Pick up edits and deletions of active voices without a full rescan. */
  function refreshBodies() {
    for (const name of [...active]) {
      const voice = voices.get(name);
      if (!voice) continue;
      let mtimeMs: number;
      try {
        mtimeMs = statSync(voice.path).mtimeMs;
      } catch {
        voices.delete(name); // file vanished
        continue;
      }
      if (mtimeMs === voice.mtimeMs) continue;
      const updated = parseVoiceFile(voice.path, voice.scope);
      if (updated) voices.set(name, updated);
      else voices.delete(name);
    }
  }

  function loaded(): Array<{ name: string; body: string }> {
    const entries: Array<{ name: string; body: string }> = [];
    for (const name of active) {
      const voice = voices.get(name);
      if (voice) entries.push({ name, body: voice.body });
    }
    return entries;
  }

  function statusLine(): string {
    return active.length ? `voice: ${active.join(" + ")}` : "voice: off";
  }

  function syncStatus(ctx: any) {
    try {
      ctx.ui?.setStatus?.("voice", active.length ? statusLine() : undefined);
    } catch {
      /* print or rpc mode has no footer */
    }
  }

  function warnUnknown(names: string[], ctx: any) {
    const unknown = names.filter((name) => !voices.has(name));
    if (unknown.length) {
      ctx.ui?.notify?.(`unknown voice: ${unknown.join(", ")}. /voice list shows what exists.`, "warning");
    }
  }

  function setActive(next: string[], ctx: any, persist: boolean) {
    warnUnknown(next, ctx);
    active = next.filter((name) => voices.has(name));
    if (persist) writeVoiceState(stateFile(), { active });
    syncStatus(ctx);
    ctx.ui?.notify?.(active.length ? statusLine() : "voice off", "info");
  }

  pi.registerFlag("voice", { description: "Activate voice(s), comma-separated", type: "string" });
  pi.registerFlag("voice-debug", { description: "Log the injected voice block to stderr", type: "boolean" });

  pi.on("session_start", async (_event, ctx) => {
    cwd = ctx.cwd;

    const seeded = seedVoices(packagedVoicesDir(), userVoicesDir());
    rescan();

    const flag = pi.getFlag("voice");
    if (typeof flag === "string" && flag.trim()) {
      flagOverride = flag.split(",").map((name) => name.trim()).filter(Boolean);
    }

    const requested = flagOverride ?? readVoiceState(stateFile())?.active ?? DEFAULT_ACTIVE;
    warnUnknown(requested, ctx);
    active = requested.filter((name) => voices.has(name));
    syncStatus(ctx);

    if (seeded.length) {
      ctx.ui?.notify?.(`pi-voices: added ${seeded.join(", ")} to ${userVoicesDir()}. Pick one with /voice.`, "info");
    }
  });

  pi.on("before_agent_start", async (event, ctx) => {
    refreshBodies();
    const entries = loaded();
    if (!entries.length) return undefined;

    const block = [
      HEADER,
      "",
      `The user selected these output voices, in order: ${entries.map((entry) => entry.name).join(", ")}.`,
      "Apply them to every response, including headings, code comments, and commit messages.",
      "When two voices conflict, the later one wins. A direct user instruction in the conversation always wins.",
      "Voices change how you write, never what is true: do not drop required detail, caveats, or verification to satisfy a voice.",
      "",
      ...entries.map((entry, index) => `### voice ${index + 1}: ${entry.name}\n\n${entry.body}`),
    ].join("\n");

    if (debugOn()) console.error(`[pi-voices] injecting ${entries.map((entry) => entry.name).join("+")} (${block.length} chars) from ${voices.get(entries[0].name)?.path}`);
    return { systemPrompt: `${event.systemPrompt}\n\n${block}` };
  });

  pi.registerCommand("voice", {
    description: "Select, stack, list, or clear output voices",
    getArgumentCompletions: (prefix: string) => {
      rescan();
      const words = ["list", "off", "add", "remove", "reload", "new", "where", ...voices.keys()];
      const items = words.map((word) => ({ value: word, label: word }));
      const matches = items.filter((item) => item.value.startsWith(prefix));
      return matches.length ? matches.slice(0, 25) : null;
    },
    handler: async (args: string, ctx: any) => {
      cwd = ctx.cwd;
      seedVoices(packagedVoicesDir(), userVoicesDir());
      rescan();

      const [verb, ...rest] = String(args ?? "").trim().split(/\s+/).filter(Boolean);

      if (!verb) {
        if (!ctx.hasUI) {
          ctx.ui?.notify?.(`voices: ${active.join(", ") || "off"}. Interactive picker needs the TUI.`, "info");
          return;
        }
        const choices = [...voices.values()].map((voice) => (voice.description ? `${voice.name} - ${voice.description}` : voice.name));
        const choice = await ctx.ui.select(
          `Voice: ${statusLine()}. Pick one. Add your own file to ${userVoicesDir()}.`,
          ["off", ...choices],
        );
        if (!choice) return;
        if (choice === "off") return setActive([], ctx, !flagOverride);
        setActive([String(choice).split(" - ")[0]], ctx, !flagOverride);
        return;
      }

      switch (verb) {
        case "list": {
          const lines = [...voices.values()].map((voice) => {
            const mark = active.includes(voice.name) ? "*" : " ";
            return `${mark} ${voice.name.padEnd(14)} ${voice.description}  [${voice.scope}]`;
          });
          ctx.ui?.notify?.(lines.length ? lines.join("\n") : "no voices found. Create one with /voice new <name>", "info");
          return;
        }
        case "off":
          setActive([], ctx, !flagOverride);
          return;
        case "reload":
          rescan();
          active = active.filter((name) => voices.has(name));
          syncStatus(ctx);
          ctx.ui?.notify?.(`${voices.size} voices: ${[...voices.keys()].join(", ")}`, "info");
          return;
        case "where":
          ctx.ui?.notify?.(
            [
              `packaged: ${packagedVoicesDir()}${existsSync(packagedVoicesDir()) ? "" : "  (missing)"}`,
              `user:     ${userVoicesDir()}`,
              `project:  ${join(cwd, ".pi", "voices")}${existsSync(join(cwd, ".pi", "voices")) ? "" : "  (none)"}`,
              `state:    ${stateFile()}`,
            ].join("\n"),
            "info",
          );
          return;
        case "add":
        case "remove": {
          if (!rest.length) return ctx.ui?.notify?.(`usage: /voice ${verb} <name>`, "warning");
          const next = verb === "add" ? [...new Set([...active, ...rest])] : active.filter((name) => !rest.includes(name));
          setActive(next, ctx, !flagOverride);
          return;
        }
        case "new": {
          const name = (rest[0] ?? "").toLowerCase().replace(/[^a-z0-9-]/g, "");
          if (!name) return ctx.ui?.notify?.("usage: /voice new <name>", "warning");
          const dir = userVoicesDir();
          mkdirSync(dir, { recursive: true });
          const path = join(dir, `${name}.md`);
          if (existsSync(path)) return ctx.ui?.notify?.(`already exists: ${path}`, "warning");
          writeFileSync(path, starterTemplate(name), "utf8");
          rescan();
          ctx.ui?.notify?.(`created ${path}. Edit it, then /voice ${name}`, "info");
          return;
        }
        default:
          setActive([verb, ...rest], ctx, !flagOverride);
      }
    },
  });
}
