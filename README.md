# Linear B — Learn & Write

A beginner website for recognising and handwriting 59 conventional Linear B syllabic signs. Eighteen short lessons introduce vowels and consonant families, three real-word readings, and selected elements of PY Ta 641.

## Run

Requires Node.js 20.19+ or 22.12+.

```sh
npm ci
npm run dev
npm test -- --run
npm run build
npm run preview
```

The static production output is `dist/`. Vite uses a relative base so assets can be hosted at a subdirectory. The ZIP is ready for GitHub Pages and includes the deployment workflow.

## Learning and handwriting

- Learn: orientation, recognition, trace, copy, memory, reverse recognition, and lesson recap.
- Write: free practice with mouse, touch, or pen. Compare preserves ink and highlights uncovered model marks in amber and distant ink in blue. Feedback stays on the device.
- Guides: numbered, replayable construction sequences for all 59 signs, with pause/resume, manual steps and reduced-motion support. Guides remain hidden in memory mode until comparison.
- Writing settings: thin/medium/bold pen, tracing opacity, centre guides, left-handed toolbar controls, and pen-only input with an accessible escape button. Preferences are saved separately from lesson progress.
- Review: separate recognition and writing cards with 1, 3, 7, 14, and 30 day intervals. A failed scheduled card returns to retry; early extra practice does not postpone a future review.
- Signs: all 59 course signs with scholarly numbers, sources, writing links, and print sheets.
- Read: the original prerequisite-gated words plus an open tablet explorer: additive numbers from 1 to 9999, six object/commodity signs, and staged excerpts from PY Aa 62, KN De 1112 and PY Ta 641.

Handwriting keeps the learner’s Again/Comfortable assessment. Geometric feedback compares position and shape with one practice form; it does not recognise handwriting, assign a grade, or judge historical authenticity. The numbered guides are modern construction suggestions derived from the bundled font, not a prescribed ancient stroke order. Conventional transliteration is not an exact pronunciation reconstruction. This is a script primer, not a full Mycenaean Greek course.

## Offline practice and installation

After deployment, open the HTTPS website online once and wait for **Ready for offline practice**. All app assets, including the sign font, are cached. Lessons, handwriting, guides and tablet exercises then work offline; external source links still need a connection.

Use **Install app** when the browser offers it, or the browser’s **Install / Add to Home Screen** menu. On iOS, use Safari’s Share menu. Installation support varies by browser. New versions show **Update and reload**; finish your drawing first because temporary ink is not saved. Clearing site data removes offline files and progress.

The build generates `dist/sw.js` from the exact production files. Cache names and URLs are scoped to the app directory, including GitHub project paths. `npm run dev` does not install a worker. Use `npm run build` followed by `npm run preview` on localhost, or HTTPS hosting, to exercise installation.

## Progress and privacy

Progress is saved only in localStorage in the current browser and device. Clearing site data removes it; other devices do not sync. Corrupt or newer-format saved data is left untouched, and unavailable storage permits session-only practice. Drawings are temporary and clear when changing sign, mode, or screen. There is no account, analytics, or server-side learner database.

## Sources and font

- [Unicode Linear B Syllabary](https://www.unicode.org/charts/PDF/U10000.pdf): character identities and conventional sign numbers.
- [Unicode 17, chapter 8](https://www.unicode.org/versions/Unicode17.0.0/core-spec/chapter-8/): encoding and script context.
- [Cambridge, The decipherment of Linear B](https://www.classics.cam.ac.uk/system/files/documents/process.pdf): historical context and beginner readings.
- [LiBER, PY Ta 641](https://liber.cnr.it/tablet/view/5344): tablet transcription, including vessel sign *201VAS.
- [Unicode Aegean Numbers](https://www.unicode.org/charts/PDF/U10100.pdf): grouped number characters.
- [Unicode Linear B Ideograms](https://www.unicode.org/charts/PDF/U10080.pdf): object sign identities.
- [Anna P. Judson, British School at Athens](https://www.bsa.ac.uk/wp-content/uploads/2022/06/Worksheet_How_to_make_a_Linear_B_tablet.pdf): PY Aa 62 and KN De 1112 teaching excerpts and context.
- [Noto Sans Linear B](https://notofonts.github.io/linear-b/): the unmodified local font, distributed under the SIL Open Font License. Licence: `public/fonts/OFL.txt`.

Tablet excerpts are typeset teaching selections, not photographs or full transcriptions. The explorer additionally includes the contiguous opening of PY Ta 641 line 2: qe-to, vessel *203VAS, quantity 3. The tripod sign is B201 (U+100E0); the Aegean number two is U+10108.

## Verification and limits

The v0.2.0 suite has 36 automated tests, covering guide completeness, missing/displaced/exact shape comparisons, writing settings validation, pause/resume/replay, additive numerals, tablet data, and service-worker offline responses at both root and project paths. Worker tests also cover failed precaching, cache isolation and user-triggered updates.

Existing automated checks cover all 59 mappings and lesson coverage, reading sequences, storage validation and write failures, review intervals and duplicate outcomes, drawing cancellation/multiple pointers and normalised geometry, quiz choice uniqueness, and agent-input validation.

The upgrade was checked at 390px and 320px widths: ink survives settings changes and resizing, feedback marks missing lines, left-handed controls move correctly, memory guides stay hidden, and tablet content fits without horizontal overflow. Number feedback and two-stage reading reveals were exercised. The preview uses HTTP, so real HTTPS service-worker installation and native device installation were not browser-tested; worker lifecycle behavior is covered by the automated harness. Physical phone/stylus checks remain outstanding.

Earlier browser checks cover the vowel journey, reload/resume, drawing and comparison, review, reference, reading gates and all three reading components, missing-font recovery, and responsive layout. Phone dimensions were simulated in browser frames (390×844, 844×390, and 320×844); these were not physical Android or S Pen tests. Enlarged text was tested with a doubled root font size. Actual DPR-2 hardware was unavailable.

Print layouts were rendered from the real print component and CSS with WeasyPrint: vowels fit one page and all 59 signs fit twelve pages in both A4 and Letter. The managed browser did not expose its native print dialog, so printer/browser-specific pagination remains unverified.

Optional WebMCP tools read progress or open trace practice where `document.modelContext` is supported. Registration and input validation are tested; the available preview browser did not provide a supported runtime for live tool calls.

## Self-host on GitHub Pages

1. Extract `linear-b-learn-github.zip`.
2. Upload the **contents** of `linear-b-learn/` into the root of `Draconov/linear-b-learn` on `main`, replacing matching files. Include `.github/workflows/deploy-pages.yml`; some file pickers hide dot-prefixed folders.
3. In GitHub, open **Settings → Pages** and choose **GitHub Actions** as the source.
4. Check the **Actions** tab for the completed deployment. Every push to `main` runs tests, builds `dist/`, and deploys it.

Upload the extracted files, not the ZIP itself. This archive contains the full source; `npm ci` restores dependencies. It does not include `node_modules` or a prebuilt `dist` directory.

The Vite build uses relative asset URLs, so the same build works at a project address such as `https://your-name.github.io/linear-b/`. The Noto font, licence, printable sheets, and favicon are included in the Pages artifact.
