/**
 * Filesystem side of pi-voices: reading voice files, resolving precedence
 * between sources, persisting the active selection, and seeding defaults.
 *
 * No pi imports here, so the logic is testable with plain node.
 */

import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";

export type VoiceScope = "packaged" | "user" | "project";

export type Voice = {
  name: string;
  description: string;
  path: string;
  scope: VoiceScope;
  mtimeMs: number;
  body: string;
};

export type VoiceSource = { dir: string; scope: VoiceScope };

/**
 * Frontmatter is optional. A bare markdown file is a valid voice, named after
 * the file. Recognised keys: name, description.
 */
export function parseVoiceFile(path: string, scope: VoiceScope): Voice | undefined {
  let raw: string;
  try {
    raw = readFileSync(path, "utf8");
  } catch {
    return undefined;
  }

  let name = basename(path).replace(/\.md$/i, "");
  let description = "";
  let body = raw;

  const frontmatter = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (frontmatter) {
    body = raw.slice(frontmatter[0].length);
    for (const line of frontmatter[1].split("\n")) {
      const pair = line.match(/^\s*([A-Za-z-]+)\s*:\s*(.+?)\s*$/);
      if (!pair) continue;
      const value = pair[2].replace(/^["']|["']$/g, "");
      if (pair[1] === "name") name = value;
      else if (pair[1] === "description") description = value;
    }
  }

  body = body.trim();
  if (!body) return undefined;

  if (!description) {
    const firstProse = body.split("\n").find((line) => line.trim() && !line.startsWith("#"));
    description = (firstProse ?? "").trim().slice(0, 110);
  }

  let mtimeMs = 0;
  try {
    mtimeMs = statSync(path).mtimeMs;
  } catch {
    /* stat raced with a delete; the caller re-reads on next rescan */
  }

  return { name, description, path, scope, mtimeMs, body };
}

/**
 * Later sources win on a name clash, so pass them lowest priority first:
 * packaged, then user, then project.
 */
export function discoverVoices(sources: VoiceSource[]): Map<string, Voice> {
  const found = new Map<string, Voice>();
  for (const { dir, scope } of sources) {
    if (!dir) continue;
    let dirStat;
    try {
      dirStat = statSync(dir);
    } catch {
      continue;
    }
    if (!dirStat.isDirectory()) continue; // a stray file at a configured voice path
    for (const entry of readdirSync(dir).sort()) {
      if (!/\.md$/i.test(entry)) continue;
      const voice = parseVoiceFile(join(dir, entry), scope);
      if (voice) found.set(voice.name, voice);
    }
  }
  return found;
}

/** Copy packaged voices the user does not have yet. Never overwrites. */
export function seedVoices(fromDir: string, toDir: string): string[] {
  if (!fromDir || !existsSync(fromDir)) return [];
  const seeded: string[] = [];
  try {
    mkdirSync(toDir, { recursive: true });
  } catch {
    return seeded; // read-only home or similar; packaged voices still resolve
  }
  for (const entry of readdirSync(fromDir).sort()) {
    if (!/\.md$/i.test(entry)) continue;
    const target = join(toDir, entry);
    if (existsSync(target)) continue;
    try {
      copyFileSync(join(fromDir, entry), target);
      seeded.push(basename(target).replace(/\.md$/i, ""));
    } catch {
      /* ignore one unreadable file, keep going */
    }
  }
  return seeded;
}

/** Returns undefined when no choice has been saved yet, which is not the same as "off". */
export function readVoiceState(stateFile: string): { active: string[] } | undefined {
  try {
    const parsed = JSON.parse(readFileSync(stateFile, "utf8")) as Partial<{ active: unknown }>;
    if (!Array.isArray(parsed.active)) return { active: [] };
    return { active: parsed.active.filter((name) => typeof name === "string") };
  } catch {
    return undefined;
  }
}

export function writeVoiceState(stateFile: string, state: { active: string[] }): void {
  mkdirSync(dirname(stateFile), { recursive: true });
  writeFileSync(stateFile, JSON.stringify(state, null, 2) + "\n", "utf8");
}

export function starterTemplate(name: string): string {
  return `---
name: ${name}
description: ${name} voice. Replace this line with when to use it.
---

Say what this voice changes. Keep it under 20 lines, because pi-voices appends
this file to the system prompt on every turn while it is active.

- One concrete rule.
- Another concrete rule.

If a rule relaxes or tightens a rule from another voice, say so, for example:
"Figurative language is allowed here, unlike rule 32 of unslop."
`;
}
