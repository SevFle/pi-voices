# pi-voices

Pick the tone of your coding agent's output with `/voice`. A voice is a markdown file of writing
rules. pi-voices appends the active voices to the system prompt on every request, so the style is
still in force 200 messages later, after context compaction has dropped the messages where you
first asked for it.

```bash
pi install npm:pi-voices
```

Restart pi, type `/voice`, pick one. The footer shows `voice: unslop`.

## See the difference

A reply with no voice applied:

> Certainly! I've updated the configuration. It's worth noting that this change is crucial for
> ensuring robust error handling, showcasing a pivotal improvement that delves into the validation
> landscape and enhances reliability going forward.

The same reply with `unslop` applied:

> Validation now lives in `parseDate` at `src/config.ts:41`. All four callers route through it, so
> the bad-date crash is fixed once instead of in each caller. `npm test` passes, 212 tests.

## Why not AGENTS.md?

Three concrete differences.

A file in the conversation window gets compacted away. pi-voices re-injects on every turn, so the
instruction is never the thing that falls out of context.

`AGENTS.md` is per-directory and static. It applies to one repo, and changing tone means editing
the file. `/voice` is global, switchable mid-session, and stackable.

Prompt shortcuts send text once. A voice changes every turn, including turns that follow a shortcut.

## Commands

| Command | Effect |
| --- | --- |
| `/voice` | Picker with every voice and its description |
| `/voice teaching` | Use one voice, replacing the current selection |
| `/voice add concise` | Stack a voice on top. Later voices win conflicts |
| `/voice remove concise` | Drop one voice from the stack |
| `/voice list` | Show voices, descriptions, where each came from, and what is active |
| `/voice off` | Stop injecting, keep the files |
| `/voice new <name>` | Write a starter file into your voices directory |
| `/voice reload` | Re-read the directories |
| `/voice where` | Print the directories and the state file in use |

Your choice persists in `~/.pi/agent/voice.json`. For one run without touching that file:

```bash
pi --voice concise
pi --voice unslop,creative
pi --voice-debug -p "summarize this diff"   # logs injected size and source file to stderr
```

## Stock voices

Six voices seed into `~/.pi/agent/voices/` on first run, and `unslop` starts active. Token counts
are what each voice adds to every request.

| Voice | It does | Tokens per turn |
| --- | --- | --- |
| `unslop` | 28 rules that strip the signals of machine-written prose | about 1200 |
| `teaching` | Explains mechanism and reasoning, still leads with the answer | about 270 |
| `creative` | Lets figurative language and varied rhythm through | about 240 |
| `concise` | Leads with the answer, no preamble, no trailing recap | about 230 |
| `professional` | Neutral register, no hedging, no corporate filler | about 225 |
| `executive` | Decision and consequence first, numbers over adjectives | about 160 |

A voice is prompt budget. Stack the ones you need.

## Write your own

Drop a markdown file in `~/.pi/agent/voices/` and it appears in the picker. Frontmatter is optional.

```markdown
---
name: audit
description: Terse findings for security review
---

- Report the finding, the file and line, and the impact.
- Skip remediation prose unless the user asks for it.
- No severity labels unless the repo already uses them.
```

Pi's own rules beat a voice, and a direct instruction in the conversation beats both. A voice
changes how output reads. It never changes what is true, so a voice must not cost you a caveat, a
failing test, or a verification step.

Resolution order, lowest priority first:

1. `voices/` inside the package. Stock defaults, seeded into your directory on first run
2. `~/.pi/agent/voices/`. Your editable copies
3. `<cwd>/.pi/voices/`. Per-repo voices, which is how you give a team one style

Seeding never overwrites a file you already have. Edit `~/.pi/agent/voices/unslop.md` and your
version wins forever.

## How it works

The package registers one extension. On `before_agent_start` it returns the system prompt with one
section appended: a tie-break line, then each active voice body in stacking order. It stats the
files on every turn and reloads the ones whose mtime changed, so edits from your other editor take
effect on the next message. `/voice` also sets a footer status showing the active stack.

It writes two things, both under `~/.pi/agent`: the saved selection in `voice.json`, and voice files
when it seeds stock voices or you run `/voice new`. It opens no sockets and starts no subprocesses.
Unpacked size is 33 kB, with no runtime dependencies.

## Requirements

Tested on pi 0.84.4 on macOS. Nothing in the package is platform specific, but Linux is untested.
Node 22.19 and up. Pi packages load through the same extension loader as any `.ts` file, so there
is no build step and no install script runs.

## Credits

The `unslop` voice is adapted from the unslop skill by
[cursor/plugins](https://github.com/cursor/plugins/blob/main/pstack/skills/unslop/SKILL.md). The
rule numbering is theirs and stays stable, so "rule 13" means the same rule in that skill and in
your notes. The set holds 28 rules numbered 3 to 33, and the gaps at 1, 2, 4, 6 and 21 are upstream
removals. The wording here is condensed for prompt use and the process prose is rewritten. The
attribution also sits in the frontmatter of `voices/unslop.md`, which is stripped before injection,
so it travels with every seeded copy at no prompt cost.

## Security

Pi packages run with your full system access, and skills can instruct the model to act on your
behalf. pi-voices reads markdown from the three directories above, writes the two files under
`~/.pi/agent` described in How it works, and rewrites the system prompt. Review the source before
you install anything, including this.

## Development

```bash
git clone https://github.com/SevFle/pi-voices
cd pi-voices
npm test              # 20 checks over parsing, precedence, seeding, state
pi install ./         # load your working copy instead of the npm copy
```

Voice files are data, so most useful contributions are new voices. Open an issue with the file and
the prompt budget you think it deserves.

## License

MIT
