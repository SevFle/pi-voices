import { mkdtempSync, writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { discoverVoices, parseVoiceFile, readVoiceState, seedVoices, writeVoiceState, starterTemplate } from "../lib/voices.ts";

const root = mkdtempSync(join(tmpdir(), "voices-test-"));
const pkg = join(root, "pkg"), user = join(root, "user"), proj = join(root, "proj");
mkdirSync(pkg, { recursive: true });
mkdirSync(proj, { recursive: true });
writeFileSync(join(pkg, "unslop.md"), "---\nname: unslop\ndescription: 33 rules\n---\n\nPackaged body\n");
writeFileSync(join(pkg, "concise.md"), "First prose becomes the description.");
writeFileSync(join(pkg, "notes.txt"), "ignored, not markdown");
writeFileSync(join(root, "stray.md"), "a file where a voice directory was configured");

let fails = 0;
const check = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) fails++;
  console.log(`${ok ? "pass" : "FAIL"}  ${label}${ok ? "" : `\n      got  ${JSON.stringify(got)}\n      want ${JSON.stringify(want)}`}`);
};

// seeding
check("seeds every packaged .md, leaves non-markdown alone", seedVoices(pkg, user), ["concise", "unslop"]);
check("second seed copies nothing", seedVoices(pkg, user), []);
writeFileSync(join(user, "unslop.md"), "user edited this\n");
check("seed never overwrites a user edit", seedVoices(pkg, user) , []);
check("user edit survives", readFileSync(join(user, "unslop.md"), "utf8"), "user edited this\n");
check("missing packaged dir is not an error", seedVoices(join(root, "nope"), user), []);

// precedence: later sources win
const sources = [
  { dir: pkg, scope: "packaged" },
  { dir: user, scope: "user" },
  { dir: join(root, "does-not-exist"), scope: "project" },
];
let found = discoverVoices(sources);
check("user copy shadows packaged", found.get("unslop").scope, "user");
check("stray file at a configured voice dir is skipped, not a crash", discoverVoices([{ dir: join(root, "stray.md"), scope: "project" }]).size, 0);
check("packaged voice still resolves when user has no copy", discoverVoices([{ dir: pkg, scope: "packaged" }]).get("concise").scope, "packaged");
check("user shadow replaces description too", found.get("unslop").description, "user edited this");
check("description falls back to first prose line", discoverVoices([{ dir: pkg, scope: "packaged" }]).get("concise").description, "First prose becomes the description.");
check("name falls back to filename", discoverVoices([{ dir: pkg, scope: "packaged" }]).get("concise").name, "concise");

// parse edge cases
writeFileSync(join(root, "blank.md"), "---\nname: blank\n---\n\n   \n");
check("bodyless file is not a voice", parseVoiceFile(join(root, "blank.md"), "user"), undefined);
check("unreadable file is not a voice", parseVoiceFile(join(root, "missing.md"), "user"), undefined);
writeFileSync(join(root, "quoted.md"), '---\nname: "quoted"\ndescription: \'single quoted\'\n---\nbody\n');
check("frontmatter quotes stripped", [parseVoiceFile(join(root, "quoted.md"), "user").name, parseVoiceFile(join(root, "quoted.md"), "user").description], ["quoted", "single quoted"]);

// state file
const stateFile = join(root, "nested", "voice.json");
check("no state file means no saved choice", readVoiceState(stateFile), undefined);
writeVoiceState(stateFile, { active: ["unslop", "concise"] });
check("state round-trips", readVoiceState(stateFile), { active: ["unslop", "concise"] });
writeFileSync(stateFile, "{ not json");
check("corrupt state is treated as unsaved, not a crash", readVoiceState(stateFile), undefined);
writeFileSync(stateFile, '{"active":"nope"}');
check("non-array active becomes off", readVoiceState(stateFile), { active: [] });
writeVoiceState(stateFile, { active: [] });
check("explicit off is distinguishable from unsaved", readVoiceState(stateFile), { active: [] });

// template must be a loadable voice
const templatePath = join(root, "audit.md");
writeFileSync(templatePath, starterTemplate("audit"));
check("starter template parses as a voice", [parseVoiceFile(templatePath, "user").name, parseVoiceFile(templatePath, "user").description.startsWith("audit voice")], ["audit", true]);

// Unslop rule ids are a citable contract, and markdown ordered lists get renumbered by linters
// (an autofix did exactly that mid-session). So ids use the R prefix, which markdown reads as
// plain text, and they run 1 to 41 with no gaps.
const unslopRaw = readFileSync(new URL("../voices/unslop.md", import.meta.url), "utf8");
const unslopIds = [...unslopRaw.matchAll(/^R(\d+)\. /gm)].map((m) => Number(m[1]));
const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
check("unslop ids are R1 to R41 with no gaps", unslopIds, range(1, 41));
check("no unslop rule sits in markdown list syntax", [...unslopRaw.matchAll(/^ ?\d+\. /gm)].length, 0);

console.log(fails ? `\n${fails} failing` : "\nall green");
process.exit(fails ? 1 : 0);
