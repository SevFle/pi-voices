---
name: tech-writing
description: For docs, READMEs, PR text, commit messages, changelogs, and agent instructions. Steps a reader can follow once.
credit: Sentence and instruction rules are written from the Google Developer Documentation Style Guide
  (developers.google.com/style, CC BY 4.0), ASD-STE100 Simplified Technical English principles
  (asd-ste100.org), and The Global English Style Guide (Kohl, SAS Press). Document types follow Diataxis
  (diataxis.fr). The agent-facing section paraphrases writing-for-agents from mattpocock/skills (MIT).
---

Use this for text the user ships: docs, README, ADR, PR description, commit message, changelog, error text, help output.

## Pick the document type first

Tutorial teaches by doing. How-to completes one task. Reference states facts. Explanation gives background. Mixing them in one page is the usual failure.

## Register

- Address the reader as "you", in the present tense. Use "will" only for what happens later.
- Name the actor. "The compiler checks the schema", not "the schema is checked".
- Write steps as commands. "Click Submit." Never "the button should be clicked".
- Put the condition before the instruction. "To delete the document, click Delete." The reader skips what does not apply.
- Common case first, exceptions after.
- Never write "simply", "easy", "quickly", or "please" in a step. If it were simple, the reader would not be reading.
- Do not pre-announce a feature. Do not start consecutive sentences with the same phrase.

## Sentences

- One instruction per sentence. Split a step past about 20 words, any other sentence past about 25.
- Put the warning or the condition before the step it guards.
- Keep the small words that carry structure. "Remove the backup file" reads one way, "Remove backup file" reads two.
- Keep "that" when it makes the sentence parse one way. "Ensure that the switch is off."
- Put "only" and "not" next to the word they change. "Only fails on growth" and "fails only on growth" differ.
- Pick one word per action and keep it. "start", not "start" here and "initiate" there.
- Give each "it", "this", and "they" one obvious noun. Repeat the noun when in doubt.
- Break long noun strings. "The proto import budget check script" becomes "the script that checks the import budget".
- No idioms, metaphors, Latin abbreviations, "(s)" plurals, or slashes. Write "a, b, or both".

## Structure

- A heading carries the point, not the topic. "Pick the document type first", not "Document types". A task heading is a verb phrase, a concept heading a noun phrase. Sentence case, one h1, no skipped levels.
- Numbered lists for sequences, bullets for genuinely parallel items. Introduce a list with a complete sentence and keep the items parallel.
- Code in code font, UI elements in bold, serial commas. Say that a list is partial instead of writing "etc.".
- Link text says where the link goes, after the page title. Never "click here".

## When the reader is an agent

Skills, AGENTS.md, prompts, hooks.

- The description field names the trigger conditions, not the topic.
- Keep each meaning in one place. A second copy costs tokens and reads as more important than it is.
- Do not restate what config, package.json scripts, or "--help" already answer. Keep what the repo cannot tell you: the convention, the reason behind a choice, the gotcha no config confesses.
- Delete instructions the model already follows by default. A sentence that changes nothing still costs context every turn.
- Give each step a completion test the agent can check, so it cannot call a vague bound "done".
