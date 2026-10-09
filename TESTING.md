# Verification record — 1.0.0

Date: 9 October 2026.

## Automated checks performed

`node --test tests/*.test.mjs` passed: **27 tests, 0 failures**. Executed with Node.js 24.19.0. Tests use Node's built-in runner; no installed test dependencies are needed.

| Area | Evidence and limits |
| --- | --- |
| Musical frequencies | A4 exactly 440; C1 32.70319566257483; C7 2093.004522404789. Semitone ratio checked throughout C1–C7, octave ratio checked. These verify numeric calculations, not sound emitted by a phone. |
| Grading | All 73 supported notes checked against all 12 answers; only pitch class matters. |
| Range and randomization | Both endpoints, single-note ranges, 5,000 real cryptographic selections within the default range, invalid range rejection, rejection of modulo-biased tail values. Repeat exclusion exhaustively mapped for all 73 possible preceding notes. |
| Defaults | C3–B5, one second, system theme, 20-question blind default; collection and all statistical views off. |
| Persistence | Settings/data roundtrip through a storage double, damaged JSON, invalid counters, invalid settings, blocked reads, quota errors, and unfamiliar future schema protection. |
| Audio scheduling | Mock AudioContext checked sine oscillator, frequency, all four durations, gain fades, disconnection, 50 replay replacements, cancellation during pending resume, and inactive cleanup. No actual AudioContext engine or audible output was used. |
| Interaction state | DOM-double tests for initial answer lock, identical replay frequencies, no replay attempts, synchronous duplicate-answer prevention, immediate correct/incorrect feedback, Next behavior and manual reference separation. |
| Settings | Min/max validation, exact C1/C7 single-note ranges, duration, reference, autoplay, no-repeat, cancelling a training change, preserving current note for appearance changes. |
| Blind sessions | Full 10-, 20-, and 50-question simulated sessions; score/streak hidden, no correctness button classes before completion, stats dialog blocked, final score correct, details setting respected, scoring without collection. |
| Statistics | Overall and by-note counts, streaks, matrix, once-per-attempt increments, history, individual/all resets, rejected reset confirmation, simulated reload persistence. No backfill or partial-session history when collection is enabled later. |
| Themes | Simulated system-light/system-dark transitions and explicit light/dark selection. Animation and feedback toggles exercised. No browser rendering was used. |
| Offline worker | Service-worker script evaluated with cache/event doubles at the exact GitHub Pages scope. All 12 app-shell entries load from real disk, all return cached responses with the network deliberately unavailable, root navigation query works, old app cache is deleted while an unrelated cache is retained, incomplete-cache readiness reports false. This does not verify actual browser worker installation. |

Additional checks performed:

- All 10 distinct local resources referenced by HTML, module imports, and manifest were found on disk and returned HTTP 200 from a local HTTP server under `/perfect-pitch-trainer/`.
- The service-worker test independently checked all 12 declared shell cache resources, including the alternate root URL.
- Manifest parses as JSON; relative scope/start URL and standalone display checked.
- Actual PNG sizes checked: 180 × 180, 192 × 192, and two 512 × 512 files.
- `app.js`, `audio.js`, and `service-worker.js` pass `node --check`.
- HTML has no remote script, stylesheet, font, or image references.
- Static CSS inspection confirms four-column note grid, safe-area padding, small-screen breakpoint, and reduced-motion gating. This does not confirm a rendered layout.
- Calculated WCAG text/background contrast exceeds 4.5:1 for both themes' main text, muted text, primary button text, and correctness/incorrectness feedback text. Calculated ratios: light main 13.39, muted 4.93, primary 7.33, correct 6.06, incorrect 5.54; dark main 15.60, muted 9.06, primary 10.32, correct 7.50, incorrect 7.55.

## What has NOT been verified

No usable Chromium or WebKit binary was available in the execution environment. No real browser rendering, real browser AudioContext, service-worker installation, browser offline mode, iPhone/iPad hardware, Safari, Home Screen installation, VoiceOver interaction, or public GitHub deployment was tested. No repository write or deployment was performed because authenticated GitHub access was unavailable. The ZIP is the deployment fallback authorized by the project brief.

CSS and manifest are designed for iPhone, but design intent and static checks are not proof of real-device behavior. Browser/device acceptance remains the following manual checklist.

## iPhone acceptance checklist

Use the installed Home Screen app on your own iPhone. Start with a comfortable low media volume.

- [ ] Safari loads the deployed address without missing files; title, all twelve notes, gear, and actual icon are visible.
- [ ] Home Screen installation opens without browser tabs or address bar.
- [ ] At the smallest available screen size, the four-column note grid, Play, Next, and dialog controls are comfortable. No horizontal page overflow. Bottom controls clear the home indicator; header clears the notch. Scroll works at large text sizes and in landscape.
- [ ] Play starts from a tap. A4 reference is audible. Try Silent Mode, headphone/Bluetooth routes, and speaker output. If sound is muted by iOS, disable Silent Mode or use headphones and tap again.
- [ ] Tap Play Again repeatedly, including during a tone. There is no stacked audio or stuck tone; the pitch stays unchanged. Very fast interruptions may produce an audible short release, which is intentional.
- [ ] Test each duration: 0.5, 1, 2, and 4 seconds. Listen for clicks at the tone edges.
- [ ] Lock the phone, switch apps, open Control Center, interrupt with Siri/a call, and return. Audio stops while inactive; a fresh Play tap recovers.
- [ ] Set range C1–C1. The note must be identified as C; use headphones. Set C7–C7 and repeat. Restore C3–B5.
- [ ] A single submitted answer locks all twelve buttons. Replay and Next do not submit extra answers.
- [ ] Reference button is distinct, never automatic, does not count, and does not unlock answering before a training note has played.
- [ ] A reversed note range cannot be saved. Appearance changes preserve the current note; training changes require confirmation and start fresh only when accepted.
- [ ] Complete a blind session. Intermediate answers show only “Answer saved”, with no score/streak/correctness colors or correct note. Final results show the correct summary and optional table.
- [ ] With collection off, blind results still work. With collection on, history and each independently enabled statistic behave as expected. Resets require confirmation.
- [ ] Change theme, range, and duration, save, close, and reopen the same installed app; settings and collected statistics remain.
- [ ] Check Light, Dark, and Follow system. Enable iOS Reduce Motion and confirm the wave/buttons do not animate. Check VoiceOver labels, modal focus, and text enlargement.
- [ ] Wait for Ready for offline use inside the Home Screen app. Disable both cellular and Wi-Fi, close, and reopen. Play, replay, settings, and grading work.
- [ ] For a future release with a new worker VERSION, deploy changed files, reopen online, see Update available, and accept it after finishing the session. The new About version appears and saved data remains.

## Re-run automated checks

A developer with Node.js 20 or newer can run this in the project directory:

```sh
node --test tests/*.test.mjs
```

`package.json` only identifies JavaScript modules and the optional test command. It has no dependencies; it is not required for hosting or app usage. Do not install anything to use the app.
