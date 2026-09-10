---
name: unslop
description: Remove AI writing tells. Vocabulary, punctuation, filler, and hedging rules with stable ids.
credit: Patterns adapted from the unslop skill in https://github.com/cursor/plugins/blob/main/pstack/skills/unslop/SKILL.md, and R31 to R41 from https://github.com/blader/humanizer/blob/main/SKILL.md (MIT, Siqi Chen), which distils Wikipedia's Signs of AI writing. Weak-alone grading and guard rails are ours. Ids are pi-voices ids, R1 to R41 with no gaps, so they differ from upstream ids. Upstream numbers its rules 3 to 33 and leaves gaps at 1, 2, 4, 6 and 21 where it removed rules, and that list maps in order onto R1 to R28. R29 and R30 are written from ASD-STE100 and Global English.
---
Edit text to remove AI patterns. Apply to prose in answers, headings, commit messages, PR text, docs, and code comments.

Process: scan for the patterns, rewrite while preserving meaning and intended tone, then ask what makes the text obviously AI generated and fix what is left.

Every rule carries its own id, R1 to R41, and no id covers a group. Notes cite these ids, so never renumber. R1 to R28 follow the upstream order, R29 and R30 are ours, R31 to R41 come from humanizer.

Grade before you act. R15, R19, R24, R35 and R36 are weak alone, so a careful writer makes them on purpose and one sighting means nothing. Act on those only when another tell shares the passage. The rest justify an edit on one sighting.

Guard rails. Keep every supported claim, and never add a fact, name, number, date, quote, or citation the source does not give. Never drop a claim to satisfy a rule. Leave a watched phrase alone inside a quotation, a title, a proper name, code, a path, a URL, or prose that talks about the phrase. Match the prose the repo already has, including its comments and commit history, and a sample the user gives outranks every rule here. Rewrite the paragraph around its point instead of patching flagged phrases one at a time.

## Content

R1. Superficial -ing riders such as "highlighting", "ensuring", "reflecting", "showcasing", "fostering", "symbolizing", "underscoring", "contributing to", "encompassing". An -ing phrase bolted onto a plain fact adds no claim. Delete them or back them with real sources.
R2. Vague attributions such as "Experts believe", "Industry reports suggest", "Some critics argue". Name the source or delete the claim.

## Language

R3. AI vocabulary: actually, additionally, align with, bolstered, crucial, deep dive, delve, enduring, enhance, fostering, garner, gate or gating used figuratively, highlight as a verb, interplay, intricate, key as an adjective, landscape as an abstract noun, meticulous, pivotal, quietly, robust used figuratively, showcase, tapestry as an abstract noun, testament, underscore, valuable, vibrant. Use plain words.
R4. Fancy ways to say "is" or "has": "serves as", "stands as", "functions as", "operates as", "boasts", "features", "offers", "maintains". Say "is" or "has".
R5. "Not just X, but Y." State the point directly. The tell also arrives split across two sentences ("This does not mean every choice is equal. It means...") and as a clipped negative tail ("..., no guessing"). Keep the contrast only when the reader really held the belief you are denying.
R6. Rule of three. Do not force ideas into groups of three. Use the natural number.
R7. Synonym cycling. Do not call one thing the protagonist, then the main character, then the central figure. Pick one term and repeat it.
R8. False ranges such as "from X to Y" where X and Y are not on one scale. List the items directly.

## Style

R9. Em dashes. Avoid them entirely. Use periods or commas. Do not substitute parentheses, en dashes, or a hyphen used as a dash. End the sentence when a thought needs separating.
R10. Colons as mid-sentence connectors. A colon before a list or an example is fine. Cut the colon when it only introduces a comparison or restatement.
R11. Boldface. Do not bold every proper noun or acronym.
R12. Inline-header lists. The tell is a bold label and colon that restates the line, as in "**Performance:** Performance improved". Write prose instead. A bold lead-in that ends in a period, names the item, and adds new detail is fine.
R13. Headings in sentence case, not Title Case.
R14. No decorative emojis in headings or bullets.
R15. Straight quotes, not curly quotes.

## Communication artifacts

R16. Chatbot phrases: "I hope this helps", "Let me know if", "Of course", "Certainly", "Would you like me to", "Want me to", "Should I continue", "Found the smoking gun". Delete them.
R17. Sycophancy: "Great question", "You're absolutely right". Answer directly.

## Filler

R18. Filler phrases: "in order to" becomes "to", "due to the fact that" becomes "because", "it is important to note that" gets deleted.
R19. Stacked hedging. "Could potentially possibly be argued that it might" becomes "may".
R20. Generic conclusions such as "The future looks bright". State the specific plan, number, or fact.

## Jargon

R21. Abstract metaphor nouns: substrate, wedge, vector, locus, vantage, nexus, primitive as a noun, harness as a metaphor, API surface, bedrock, scaffolding as a metaphor, modality, paradigm, gold-plating, ratchet as a metaphor, evacuate for moving code, endgame, north star, flywheel. Each has a plainer concrete word. "Substrate" becomes "base". "Wedge in" becomes "add". "Vector" becomes "way". "Gold-plating" becomes "more than the job needs". "Ratchet" becomes the mechanism's name or "a limit that only tightens". "Evacuate" becomes "move out". "Endgame" becomes "the last phase".

## Plain speech

R22. Say what it does, not how it feels. "The database stays close at hand" names a feeling. "`.toSQL()` returns the exact string sent to the database" names the mechanism. Ask what a sentence tells the reader to do or know, then write that. If the sentence would fit any other project's docs unchanged, cut it.
R23. Split dense sentences. One idea per sentence. If the reader must backtrack, break the sentence or drop a clause.
R24. Active voice. Catch "is/are/was/were + past participle" and name the actor. "Queries are validated" becomes "the compiler validates queries". Passive is fine when the actor is unknown or does not matter.
R25. Cut adverbs or use a stronger verb. "Runs quickly" becomes "is fast" or the number. "Significantly improves" becomes the measured delta.
R26. Prefer the plain word. Utilize and leverage become use, facilitate becomes help, numerous becomes many, "in the event that" becomes if.
R27. Mannered prose: aphorisms such as "wire it or delete it", rhetorical fragments for effect, personified code, figurative verbs such as "rides along" and "stands on", stock framing phrases. "A dial worth turning" becomes "a parameter worth varying".
R28. Over-compression. Dropped articles, verbless fragments, arrows, and abbreviations make the reader decode instead of read. "Parser rejects bad date -> exit 2, no write" becomes "The parser rejects a bad date, exits with code 2, and writes nothing."
R29. No slashes, no semicolons. "a/b" becomes "a, b, or both". A semicolon becomes a period and a new sentence.
R30. Every "it", "this", "which" and "they" points at one named thing. Repeat the noun when a reader could guess wrong. Never let "this" stand for a whole clause.

## Staging instead of stating

R31. One-line closer and send-off. Cut the one-sentence paragraph that restates the one before it, "That is the real win", "Read that again", "Let that sink in", and the same closer after several sections. Cut a row of fragments ("No aesthetic prior. No nostalgia.") and merge it into one sentence with a claim in it. Cut the closing paragraph that promises a future. End on the last concrete fact.
R32. Arguing with no one. Cut "This isn't mainly about", "I'm not saying", "To be clear", "Don't get me wrong", "You might think... but", "A tempting approach would be", "It would be easy to just". Several unrelated rejections in a row is the stronger sign. Keep an objection the text answers in full, and an option a reader would really weigh.
R33. Sayings dressed as depth. Cut "the real question is", "at its core", "in reality", "fundamentally", "what really matters", "the heart of the matter", "X is the Y of Z", "X becomes a trap", "the language of", "the currency of". Name the specific claim.
R34. Staged run-up. Cut "Let's dive in", "Let's explore", "Here's what you need to know", "Now let's look at", "Quick note", "Here's the thing", and "Honestly?" as a standalone opener. Remove the run-up, not just its tone. "Look" or "honestly" inside a real sentence is ordinary.

## Padding, leftovers, and echoes

R35. Repeated openings. Merge sentences that start with the same subject three times running, or change the subject and lead with the action. Weak alone. Writers repeat an opening on purpose sometimes ("She came. She saw. She conquered.").
R36. Hyphenated pairs everywhere. Keep the hyphen before a noun when grammar needs it ("a high-quality report"), drop it after ("the report is high quality"). Weak alone, so do not strip every compound you see.
R37. Vague connection. "Associated with", "in connection with", "linked to", "tied to" says two things meet and hides how. Name the relationship the source gives. If the source is vague, stay vague rather than inventing a role.
R38. Sales voice. Cut "boasts", "nestled", "in the heart of", "renowned", "breathtaking", "vibrant", "diverse array", "must-visit", "profound", "commitment to", "natural beauty", "exemplifies". State what the thing is.
R39. Knowledge-limit filler. Cut "as of my last training update", "based on available information", "not publicly available", "not widely documented", "it is believed that", "likely grew up", "maintains a low profile". Say what the sources do not show, or drop the sentence. Never dress a guess as a fact. A missing citation is not a tell, since most writing is unsourced.
R40. Previous-version prose. Comments and docs state current behavior, not what the code replaced. Move that history to the changelog, the commit message, or the migration guide.
R41. Heading echo. Cut the line under a heading that restates the heading. The heading already said it.
