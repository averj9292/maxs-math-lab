# Max's Math Lab — Adaptive Learning Edition

An offline-capable family learning prototype for addition and subtraction, designed for grades 2–4. **Max is the co-creator and game tester.** No accounts, ads, analytics, external libraries or remote services. Progress saves automatically in the device's local browser storage. Clearing website data or switching site origins can erase progress.

## What changed

- 14 ordered skills with prerequisite unlocks: addition/subtraction foundations, two-digit regrouping, three-digit regrouping (including borrowing across zero), missing-number equations, word problems and multi-step challenges.
- Algorithmically generated questions; recent signatures are avoided to reduce repeats.
- Learning mastery is **not** based on stars: 7 of the last 8 attempts must be first-try correct without opening Teach Me, and the final 3 must also meet that standard. Wrong answers invite another try instead of showing the solution immediately. A question solved after a retry or hint still earns a star but does not count as independent mastery.
- Previously mastered skills receive periodic review; repeated review errors reopen a skill. A parent-readable learning report shows mastery status.
- Teaching steps describe place value and regrouping, including borrowing across zeros; read-aloud remains optional.
- Existing local stars, avatar, worlds and collections are preserved when upgrading at the **same URL**. The new learning record starts fresh because old attempts do not reliably capture help/retries.

## Important limitations

This is **not** a clinically validated or curriculum-certified adaptive assessment. Mastery thresholds are practical prototype heuristics, not proven learning measures. The app does not diagnose misconceptions with certainty. Teaching is text-first rather than a fully animated base-ten-block tutor. Current scope is addition/subtraction and related problems; a full grade 2–4 curriculum would also cover multiplication, division, fractions, measurement and geometry. A timed mode is for optional play, not mastery assessment.

## Publish

Upload the eight runtime files (`index.html`, `style.css`, `app.js`, `learning.js`, `sw.js`, `icon.svg`, `manifest.webmanifest`, `README.md`) to the GitHub repository root. GitHub Pages → deploy from `main` branch `/ (root)`. In iPad Safari open the URL, Share → Add to Home Screen. The website is publicly accessible. Do not add personal information to the source files.

## Test

Run `node test-learning.js` locally to check generator arithmetic, constraints, skill prerequisites and mastery logic. Test touch interactions and Home Screen persistence on the real iPad before school use.
