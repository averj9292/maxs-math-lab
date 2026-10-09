# Max's Math Lab — Adventure Learning Prototype

A private-progress, offline-capable children's math adventure for approximately Grades 2–4. Max is the co-creator and game tester. No login, tracking, advertising, or analytics. Progress, stars and unlocked worlds remain in this device's browser storage.

## Child-friendly learning flow

- **Default: My learning path**. Introduces addition/subtraction progressively using prerequisite mastery. It does **not** automatically serve multiplication, fractions or advanced strands.
- **Player choices**: Addition, Subtraction, Addition + Subtraction, or optional **Explore more math (harder)**. Changing topic does not reset mastery, adventure milestones or rewards.
- **34 implemented prototype skills**, including the original 14 addition/subtraction skills and 20 additional skills spanning equal groups, multiplication, division, simple fractions, length, mass, time, Canadian coins, geometry, area and picture graphs. Advanced content must be deliberately selected.
- **Mastery heuristic**: at least 10 completed exercises per skill, ending with 5 unaided, first-try correct exercises in a row. Retry/Teach Me can still earn adventure stars but do not count as successful first tries for mastery.
- Short diagnostic feedback for common errors (including confusing perimeter and area, adding instead of multiplying, and choosing addition instead of subtraction). Feedback is heuristic, not an assessment of all possible misconceptions.
- **Picture tutor** shows place-value manipulatives, equal groups, simple fractions, arrays/tiles, coins, comparisons and other visuals. Interactive regrouping shows a ten exchanged for ten ones. This remains a simplified introductory tutor, not a full animated mathematics pedagogy system.
- Optional Math Minute mode is just for play; timing is not used to decide mastery.
- **Long adventures**: 12 missions per world, 10 completed problems per mission, plus repeatable bonus missions. World progress and educational skill mastery are separate tracks.

## Mental Math Playground and optional hands-on tutor

- A **Mental Math Playground** opens from the header without affecting stars, streaks, or skill mastery. Players choose a friendly addition challenge, tap counters or drag a loose counter into the first ten-frame, see the ten completed, undo moves, reset, or choose another puzzle.
- Within **Teach me → Try a clever way**, a make-ten addition problem also offers a hands-on ten-frame where the child can move counters to build a ten themselves. Opening tutoring still marks help as used for mastery logic; playful experimentation outside a problem does not.
- These exercises teach common make-ten number-sense methods with original implementations; they are not Greg Tang's proprietary games or lesson materials.
- Works with tap-first interaction on touch devices; drag is supported when dropping onto the receiving frame.

## Responsive practice and visual lesson cycle

- **Watch:** a guided explanation with visual place-value models and, for numeric addition/subtraction, a second strategy using number jumps.
- **Try with blocks:** children exchange 1 ten for 10 ones, or 1 hundred for 10 tens. The value does not change; the blocks are shown in a concrete visual display. Borrowing across zero can involve multiple exchanges.
- **Solve myself:** hides the explanation so the child can complete the original challenge. Opening hints counts as supported work for mastery, but never removes a star or collectible.
- **Responsive coaching:** once a skill has at least 3 recorded attempts and 2 of the last 4 required help or retry, the engine can offer 2 prerequisite practice questions, then return to ordinary practice. A cooldown avoids repeatedly interrupting a child on the same skill. This is a friendly heuristic, not a diagnosis.
- **Review:** previously mastered, eligible skills are periodically reintroduced to check retention.
- **Existing data stays** in the same local storage key, including worlds, stars, answers and prior learning. Older learning records are normalized with the new coaching fields.

## Max Mode — unofficial fan-made engineering headquarters

A surprise bonus lab inspired by Mark Rober and CrunchLabs. This mode uses an original design and the blue, red and yellow palette referenced in CrunchLabs' public style guide. The CrunchLabs name is attributed, linking to the official CrunchLabs site; this is **not an official CrunchLabs or Mark Rober product**, and it does not reproduce their official logo.

**Enter the code** from the adventure world map:
1. Press and hold the explorer avatar (the animal emoji in the world-map summary) for roughly one second, or tap it three times quickly. Keyboard Enter also arms code entry.
2. Tap the world buttons in the order **Space → Drawing → Jungle → Space**.
3. The world icons remain visible for code entry even if the worlds are locked. Ordinary world buttons behave exactly as before when code entry isn't armed.
4. Return to the world map with the lab's Exit button. The same secret pattern works again next time.

This is a playful easter egg, not a password or access-control system. The site's source is public; anyone inspecting the JavaScript can find the code.

The secret mode includes three offline experiments:
- **Launcher Lab:** Choose power and angle, predict where a simulated ball will land, then test and adjust settings. Complete three increasingly distant targets.
- **Bridge Builder:** Use the fewest five-unit-strength beams needed to hold three cargo loads; see multiplication and efficient design principles.
- **Chain Reaction:** Solve three missing-number addition/subtraction equations to activate a machine.
- Three persistent inventor badges, a local experiment notebook and a final inventor certificate. These do not change adventure stars, school-math mastery or learning skill records.

The launcher simulation is simplified and labelled as such; it does not promise accurate real-world ballistic measurements. Experiment notes and badges remain on this device and are included in the ordinary progress save.

Brand context: https://www.crunchlabs.com/pages/press . All artwork and activities inside Max Mode are original. Do not add official logos without permission.

## Scope and limitations

This is **not** clinically validated, independently evaluated for learning outcomes, or certified to any provincial curriculum. It is an evolving family game. Grade labels and sequencing are approximations and require educator review. Visuals and hints support exploration but do not replace instruction from a teacher. Review the generated questions with a child at their actual current skill level.

## Publishing and privacy

GitHub Pages publishes from the default branch. Installed iPad Home Screen apps stay at the same URL and receive updated files when they reconnect, sometimes requiring closing and reopening the app. Do not clear Safari website data unless you intend to lose this device's saved progress.

All site illustrations, JavaScript and CSS are served from the same GitHub Pages origin. Do not add identifying details about the child to the website or source code.
