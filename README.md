# pi-voices

Selectable output voices for [pi](https://pi.dev), the coding agent. A voice is a markdown file of
writing rules. pi-voices appends the active voices to the system prompt on every turn, so the style
survives context compaction instead of drifting out of the transcript.

```bash
pi install npm:pi-voices
```

Then run `pi`, type `/voice`, and pick one.

## Usage

| Command | Effect |
| --- | --- |
| `/voice` | Picker with every voice and its description |
| `/voice teaching` | Use one voice, replacing the current selection |
| `/voice add concise` | Stack a voice on top. Later voices win conflicts |
| `/voice remove concise` | Drop one voice from the stack |
| `/voice list` | Show voices, descriptions, source, and what is active |
| `/voice off` | Stop injecting, keep the files |
| `/voice new <name>` | Write a starter file into your voices directory |
| `/voice reload` | Re-read the directories after you edit files |
| `/voice where` | Print the directories and the state file it uses |

Selection persists in `~/.pi/agent/voice.json`. For a one-off run without touching that file:

```bash
pi --voice concise
pi --voice unslop,creative
pi --voice-debug -p "…"   # logs the injected size and source file to stderr
```

A fresh install seeds the six stock voices into `~/.pi/agent/voices/` and starts with `unslop`
active. Set your own pick once with `/voice`, and it stays.

## Stock voices

| Voice | It does |
| --- | --- |
| `unslop` | 33 rules that remove the signals of machine-written prose |
| `concise` | Leads with the answer, no preamble, no trailing recap |
| `professional` | Neutral register, no hedging, no corporate filler |
| `teaching` | Explains mechanism and reasoning, still leads with the answer |
| `creative` | Lets figurative language and varied rhythm through |
| `executive` | Decision and consequence first, numbers over adjectives |

`unslop` costs about 1.2k tokens per turn. The rest run 150 to 300 tokens each. A voice is prompt
budget, so stack deliberately.

## Writing your own voice

Drop a markdown file in `~/.pi/agent/voices/` and it shows up after `/voice reload`. Frontmatter is
optional:

```markdown
---
name: audit
description: Terse findings for security review
---

- Report the finding, the file and line, and the impact.
- No remediation prose unless the user asks for it.
```

Rules that pi already respects win over a voice, and a direct instruction in the conversation wins
over both. A voice changes how output reads, never what is true.

Resolution order, lowest priority first:

1. `voices/` inside the package. Stock defaults, seeded into your directory on first run
2. `~/.pi/agent/voices/`. Your editable copies
3. `<cwd>/.pi/voices/`. Per-repo voices, which is how you ship a team style

Seeding never overwrites a file you already have. Delete a file and it comes back on the next start
unless you replaced it with your own content.

Environment overrides, mostly for CI and tests: `VOICE_DIR`, `VOICE_STATE`, `VOICE_PACKAGED_DIR`.

## How it works

The extension listens on `before_agent_start` and returns the system prompt with one appended
section: the active voice bodies in stacking order, preceded by a tie-break instruction. It
re-reads the files on every turn, so edits in another editor take effect on the next message
without `/voice reload`. `/voice` also registers a footer status showing the active stack.

## Security

Pi packages run with your full system access, and skills can instruct the model to act. This
package registers one extension that reads markdown from the three directories above and rewrites
the system prompt. Review the source before you install anything, including this.

## Credits

The `unslop` voice is adapted from the **unslop** skill by [cursor/plugins](https://github.com/cursor/plugins/blob/main/pstack/skills/unslop/SKILL.md).
Its rule numbering is upstream, so `unslop` rule 13 means the same rule there and in any notes that
cite it. The wording is condensed and the process prose is rewritten for prompt use; the pattern
list and the stable rule ids are theirs. The attribution also lives in the frontmatter of
`voices/unslop.md`, so it travels with every seeded copy.

## License

MIT
