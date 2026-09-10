---
name: unslop
description: Remove AI writing tells. Vocabulary, punctuation, filler, and hedging rules with stable ids.
credit: Adapted from the unslop skill in https://github.com/cursor/plugins/blob/main/pstack/skills/unslop/SKILL.md. Rule numbers are upstream ids, kept stable.
---

Edit text to remove AI patterns. Apply to prose in answers, headings, commit messages, PR text, docs, and code comments.

Process: scan for the patterns, rewrite while preserving meaning and intended tone, then ask what makes the text obviously AI generated and fix what is left.

Rule numbers are stable ids, so other notes can cite them, for example "fix 13 and 27". Do not renumber.

## Content

3. Superficial -ing phrases such as "highlighting", "ensuring", "reflecting", "showcasing", "fostering". Delete them or back them with real sources.
5. Vague attributions such as "Experts believe", "Industry reports suggest", "Some critics argue". Name the source or delete the claim.

## Language

7. AI vocabulary: additionally, crucial, delve, enduring, enhance, fostering, garner, interplay, intricate, landscape as an abstract noun, pivotal, showcase, tapestry as an abstract noun, testament, underscore, vibrant. Use plain words.
8. Fancy ways to say "is": "serves as", "stands as", "boasts", "features". Say "is" or "has".
9. "Not just X, but Y." State the point directly.
10. Rule of three. Do not force ideas into groups of three. Use the natural number.
11. Synonym cycling. Do not call one thing the protagonist, then the main character, then the central figure. Pick one term and repeat it.
12. False ranges such as "from X to Y" where X and Y are not on one scale. List the items directly.

## Style

13. Em dashes. Avoid them entirely. Use periods or commas. Do not substitute parentheses, en dashes, or a hyphen used as a dash. End the sentence when a thought needs separating.
14. Colons as mid-sentence connectors. A colon before a list or an example is fine. Cut the colon when it only introduces a comparison or restatement.
15. Boldface. Do not bold every proper noun or acronym.
16. Inline-header lists. The tell is a bold label and colon that restates the line, as in "**Performance:** Performance improved". Write prose instead. A bold lead-in that ends in a period, names the item, and adds new detail is fine.
17. Headings in sentence case, not Title Case.
18. No decorative emojis in headings or bullets.
19. Straight quotes, not curly quotes.

## Communication artifacts

20. Chatbot phrases: "I hope this helps", "Let me know if", "Of course", "Certainly", "Found the smoking gun". Delete them.
22. Sycophancy: "Great question", "You're absolutely right". Answer directly.

## Filler

23. Filler phrases: "in order to" becomes "to", "due to the fact that" becomes "because", "it is important to note that" gets deleted.
24. Stacked hedging. "Could potentially possibly be argued that it might" becomes "may".
25. Generic conclusions such as "The future looks bright". State the specific plan, number, or fact.

## Jargon

26. Abstract metaphor nouns: substrate, wedge, vector, locus, vantage, nexus, primitive as a noun, harness as a metaphor, API surface, bedrock, scaffolding as a metaphor, modality, paradigm, gold-plating, ratchet as a metaphor, evacuate for moving code, endgame, north star, flywheel. Each has a plainer concrete word. "Substrate" becomes "base". "Wedge in" becomes "add". "Vector" becomes "way". "Gold-plating" becomes "more than the job needs". "Ratchet" becomes the mechanism's name or "a limit that only tightens". "Evacuate" becomes "move out". "Endgame" becomes "the last phase".

## Plain speech

27. Say what it does, not how it feels. "The database stays close at hand" names a feeling. "`.toSQL()` returns the exact string sent to the database" names the mechanism. Ask what a sentence tells the reader to do or know, then write that. If the sentence would fit any other project's docs unchanged, cut it.
28. Split dense sentences. One idea per sentence. If the reader must backtrack, break the sentence or drop a clause.
29. Active voice. Catch "is/are/was/were + past participle" and name the actor. "Queries are validated" becomes "the compiler validates queries". Passive is fine when the actor is unknown or does not matter.
30. Cut adverbs or use a stronger verb. "Runs quickly" becomes "is fast" or the number. "Significantly improves" becomes the measured delta.
31. Prefer the plain word. Utilize and leverage become use, facilitate becomes help, numerous becomes many, "in the event that" becomes if.
32. Mannered prose: aphorisms such as "wire it or delete it", rhetorical fragments for effect, personified code, figurative verbs such as "rides along" and "stands on", stock framing phrases. "A dial worth turning" becomes "a parameter worth varying".
33. Over-compression. Dropped articles, verbless fragments, arrows, and abbreviations make the reader decode instead of read. "Parser rejects bad date -> exit 2, no write" becomes "The parser rejects a bad date, exits with code 2, and writes nothing."
