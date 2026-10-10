# Erik’s Music Lab

A free, installable music practice web app with **Grand Piano**, **Chromatic Tuner**, **Metronome**, **Synth**, **Drum Machine**, **Practice Room**, **Recording Studio**, and a guided **Ear Trainer** for pitch, intervals, chords and scales. Explore music, train your ear and build musical confidence at your own pace. Settings and training progress are saved locally; offline use is supported after the app and required audio assets have been cached.

**Preview app:** https://erikjohn-dog.github.io/eriks-music-lab-preview/

## Add to your iPhone Home Screen

1. Open the Preview link above in **Safari** on your iPhone.
2. Tap **Share** (or the Safari menu containing Share).
3. Choose **Add to Home Screen**.
4. Keep **Open as Web App** enabled if offered, then tap **Add**.
5. Launch **Erik’s Music Lab** from your Home Screen while online so offline files can finish caching.

## Changelog

- 1.1.14 · Added optional detailed vocal note measurements showing note name, time interval, estimated frequency in Hz, and cents deviation from nearest equal-tempered note (A4=440 Hz). Existing detection, key ranking and experimental SoundTouch tools retained; no audio edits.


- 1.1.13 · Finalized analysis-first Vocal Pitch panel: scale/key detection remains prominent; experimental real-time pitch correction is retained in a collapsible advanced section with explicit limitations. Re-analysis turns off active correction, and pitch/speed reset also disables correction. Existing transpose and SoundTouch engine remain available; recordings and exports unchanged.


- 1.1.12 · Fixed missed update checks: app now requests a service worker update at startup and when returning to foreground, not just on network reconnection. Preserves opt-in activation and offline storage.


- 1.1.11 · Experimental non-destructive real-time note-by-note pitch correction via existing local SoundTouch worklet. After analyzing a monophonic vocal recording, enable the pitch engine and toggle Pitch correction ON. Strength 0–100%; correction follows detected note intervals and selected scale, resetting to base transpose outside notes. Effects/export remain original-only; mobile timing and artifacts need testing.


- 1.1.10 · Added Detect key to Vocal Note Curve. Ranks all 12 major and 12 natural-minor scales using duration-weighted detected notes, shows percentage of note duration in scale and flags ambiguous matches. Auto-selects suggested key and mode for correction preview; no audio changes.


- 1.1.9 · Added key and major/minor/chromatic scale selection to the vocal note analysis. Each detected segment now shows the nearest scale-note correction suggestion (preview only); no audio is altered.


- 1.1.8 · Vocal note segmentation beta: group stable detected pitch frames into note intervals, display note names and timestamps, and tap a note to start playback at its onset. Detection is approximate; no automatic tuning or audio changes are applied.


- 1.1.7 · Improved vocal pitch detection with adaptive silence threshold, 45 ms frame spacing, brief-gap interpolation and connected note curve labeled with note names. Still an experimental monophonic detector, not pitch correction.


- 1.1.6 · Added optional offline vocal pitch map (beta): analyze up to 90 seconds of monophonic audio and show detected MIDI pitches over time. Approximate autocorrelation detection may miss quiet notes or report octave errors. No pitch correction is applied.


- 1.1.5 · Added reset for SoundTouch pitch and playback speed, smoothed SoundTouch speed updates and added a clear warning when combined processing may create artifacts. Auto-Tune, multi-track and rendered FX export remain future work.


- 1.1.4 · Replaced broken external SoundTouch imports with local vendor paths. GitHub Actions workflow builds the pinned 2.1.1 node bundle and processor into vendor/; app-shell caching includes both. Deployment requires successful workflow build and commit; otherwise the new service worker intentionally refuses incomplete shell installation.


- 1.1.3 · Experimental opt-in SoundTouchJS AudioWorklet live transposition (±5 semitones). Uses external pinned CDN modules for this feasibility test, so first activation requires network and offline operation is not guaranteed. Existing playback and original recordings remain available as fallback; iOS audio testing is pending.


- 1.1.2 · Removed the unsuccessful granular transpose beta due to hollow, quiet vocals and unreliable pitch changes. Existing audio tools remain unchanged; a more suitable pitch-shifting engine will be evaluated before reintroducing transpose.


- 1.1.1 · Added opt-in experimental offline granular transpose preview (±7 semitones, max 30 seconds) that preserves playback duration, with a return-to-original button. Source recordings and original exports remain unchanged; grain artifacts are expected and mobile performance is unverified.


- 1.1.0 · Temporarily disabled the unreliable transpose and global pitch-assist UI. Restored predictable playback-speed behavior while a tempo-preserving pitch engine is designed. No original recordings changed.


- 1.0.99 · Corrected outdated version labels in footer and About; bumped service worker cache to distribute updated app shell.


- 1.0.98 · Added semitone transpose and experimental dominant-pitch assist in Neon DAW. Pitch changes use playback rate and therefore affect tempo. Not full note-by-note Auto-Tune; original recordings remain untouched.


- 1.0.97 · Neon DAW exports the marked IN/OUT passage as a 16-bit PCM WAV file without changing the original recording. Export selection activates only for valid markers. Live effects are not baked into WAV exports.


- 1.0.96 · Fixed Neon DAW loop playback with frame-based IN/OUT boundary checks and end-of-track restart, including Safari-friendly handling.


- 1.0.95 · Renamed Recording Studio to Neon DAW; added waveform zoom, IN/OUT markers and non-destructive loop playback. Planned: integration with Piano, Erik’s Synth and Drum Machine (not implemented yet).


- 1.0.94 · Redesigned Recording Studio as responsive Neon DAW with fixed transport area, prominent seekable waveform timeline, compact FX rack, desktop library sidebar and mobile library drawer; retained original recordings and audio engine.


- 1.0.93 · Recording Studio adds waveform display, live reverb and echo with delay controls, and neon-pink styling for light and dark modes. Practice Studio renamed to Practice Room in the interface.


- 1.0.92 · Introduced Recording Studio: microphone recording, audio import, local IndexedDB library, playback speed, rename, deletion and original-file export. First step toward non-destructive effects and multi-track editing.


- 1.0.91 · Added Cache All Audio Samples in General Settings with progress and retry support for missing Grand Piano and drum samples. Preserved existing sample caches across service-worker updates.

- 1.0.90 · Standardized all Ear Trainer exercise back buttons to “← Ear Trainer” with consistent purple navigation styling. Sing the Note now matches the Ear Trainer purple palette in light and dark themes, while keeping neon-green correct-pitch feedback.

- 1.0.89 · Practice Room now opens only on an intentional tap/click, not during a swipe. Sing the Note uses ±50-cent tolerance with a short dropout grace period while preserving cents feedback, and glows neon green only when the target is detected.

- 1.0.88 · Practice Room eyebrow matches neon magenta theme. Sing the Note gains coordinated Ear Trainer light/dark styling, octave-independent pitch option, automatic challenge advancement after 1.5 seconds of correct singing, and three-second piano/sine reference playback using Ear Trainer General Settings.

- 1.0.87 · Practice Room adds a persistent Practice Timer usable while navigating other tools, editable completion notes and ratings, reusable multi-block session templates, weekly goals by instrument and progress, plus harmonized All tools navigation styling in Piano and Practice Room.

- 1.0.86 · General Audio Samples Status now checks Grand Piano, electronic and acoustic Drum Kit caches and explains the synthesized kit; About copy simplified, daily average clarified, Practice Room touch entry improved.

- 1.0.85 · Add Session supports daily, weekly and selected-weekday recurring schedules with end dates and vacation-day exclusions; date navigation gains previous/next day arrows. Practice Room now uses coordinated neon-violet accents and a matching rounded home icon in light and dark themes.

- 1.0.84 · Practice Room gains neon magenta home icon, proper light/dark theme colors, detailed instrument/date/rating insights, daily and weekly averages, vacation calendar days excluded from statistics and new goal plans, Singing naming, and mobile date-input layout fix.

- 1.0.83 · Simplified Practice Room Overview: upcoming sessions first, then calendar, then time statistics. Removed hero, recent sessions and goals from Overview; completed history stays in Sessions. Tightened header spacing and centered calendar month arrows.

- 1.0.82 · Practice Room goal plans now include five progressive learning phases, specific session tasks, milestone progress and rescheduling of missed sessions into free practice days before the deadline. Existing local sessions and goals remain supported.

- 1.0.81 · Practice Room redesign: prominent upcoming sessions, separate history, larger colorful calendar, navigation tabs, session editing, instrument filters, goal management, progress insights, and new home-screen icon.

- 1.0.80 · First implementation of Practice Room (local calendar, completed/planned sessions, multiple instruments, statistics, goal scheduling, voice recovery reminder) and Ear Trainer Sing the Note (named note/chord/scale reference, microphone pitch feedback). Further guided lessons and planning refinements to follow.

- 1.0.79 · Home screen version label; README and About clarify that Perfect Pitch belongs to the Ear Trainer.

Complete recorded Preview changelog (all entries preserved from the app’s previous About section; earlier versions without a recorded entry are not reconstructed):

- 1.0.78 · Shortened repository README with Home Screen instructions and full available changelog; redesigned in-app About with features, goals and version only.
- 1.0.77 · Save settings moved to the top of General Settings, Ear Trainer Settings and Perfect Pitch Settings for easier access.
- 1.0.76 · Ear Trainer code audit: varied question coverage for large Scales challenges, updated completed-course labels, and checks across Intervals, Chords and Scales.
- 1.0.75 · Scales complete: Chapter 15 Melodic Context and Chapter 16 Scale Mastery, including melodic-phrase recognition and final challenges.
- 1.0.74 · Scales Chapter 13 Scale Degrees and Chapter 14 Scale Recognition: characteristic scale tones and 19 guided lessons with listening challenges.
- 1.0.73 · Scales Chapter 11 World Scale Families and Chapter 12 Exotic & Rare: contextualized theory, 15 lessons and listening challenges.
- 1.0.72 · Scales Chapter 09 Symmetrical Scales and Chapter 10 Bebop & Jazz: 17 new guided lessons and listening challenges.
- 1.0.71 · Scales Chapter 07 Melodic Minor Modes and Chapter 08 Harmonic Major, with seven modal lessons and three listening levels each.
- 1.0.70 · Scales Chapter 05 Blues and Chapter 06 Harmonic Minor Modes, including 16 guided lessons and listening challenges.
- 1.0.69 · Scales Chapter 03 Major Modes and Chapter 04 Pentatonic: guided theory, listening comparisons and challenges.
- 1.0.68 · Fixed Chords lesson routing across all 15 chapters: correct lesson titles, theory text and practice screens.
- 1.0.67 · Scales chapters 01 Major & Minor and 02 Minor Variations, with guided listening, scale identification and saved practice stars.
- 1.0.66 · Chords Chapter 15 Chord Mastery: guided review, themed listening rounds and a comprehensive mixed challenge across all chord families.
- 1.0.65 · Chords Chapter 13 Modal Harmony and Chapter 14 Advanced Structures, with modal colors, quartal harmony, clusters, slash chords and polychords.
- 1.0.64 · Chords Chapter 11 Functional Harmony and Chapter 12 Progressions, with contextual chord sequences, cadences and graded listening challenges.
- 1.0.63 · Chords chapters 09 Altered Dominants and 10 Voicings.
- 1.0.62 · Chords Chapter 07 Ninth Chords and Chapter 08 Extended Harmony, with guided lessons, listening comparisons and challenges.
- 1.0.61 · Chords Chapters 05 Advanced Sevenths and 06 Added Tones, with theory, listening comparisons and challenges.
- 1.0.60 · Chords Chapter 03 Inversions and Chapter 04 Seventh Chords, with guided listening, practice and challenges.
- 1.0.59 · Chords Chapter 02: Triad Families lessons, listening practice and challenge.
- 1.0.58 · Complete light theme with coordinated per-tool colors, accessible daylight cards, instrument panels, ear training, piano notation and settings. Dark theme unchanged.
- 1.0.57 · Completed all twelve Intervals chapters: enharmonic spelling with written-note questions, musical context and interval mastery.
- 1.0.56 · Landscape Piano keyboard navigation between title and settings; Intervals chapters 08 Inversions and 09 Compound Intervals.
- 1.0.55 · Portrait Piano swipe navigation strip and accurate glissando key highlighting; Intervals chapters 06 Direction and 07 Harmonic Intervals.
- 1.0.54 · Piano and Synth finger glissando; Intervals chapters 04 and 05 with guided theory and practice.
- 1.0.53 · Intervals Chapter 02 Steps & Leaps and Chapter 03 Perfect Intervals with theory, examples and graded listening.
- 1.0.52 · Fixed-height portrait Piano notation; Intervals First Steps now teaches three intervals before two graded listening challenges.
- 1.0.51 · Theory-only Major and Minor Triad lessons no longer show stars; old ratings are cleared.
- 1.0.50 · Portrait Piano polyphonic staff, interval labels and chord recognition.
- 1.0.49 · German piano note names, five-step Chords Chapter 1 and configurable quiz length.
- 1.0.48 · Chords Chapter 1: six guided major/minor levels, transposed listening quizzes, arpeggios and combined playback.
- 1.0.47 · Refined Perfect Pitch icon with a clear single musical note.
- 1.0.46 · Ear Trainer settings aligned with back navigation and bespoke musical icons.
- 1.0.45 · Transposed ear-training examples and customizable practice flow.
- 1.0.44 · Shared Ear Trainer sound settings for Perfect Pitch, Intervals, Chords and Scales.
- 1.0.43 · Guided Ear Trainer foundation: chapters, introductory lessons, listening quizzes and saved stars.
- 1.0.42 · Ear Trainer exercise menu with Perfect Pitch and three future modules; clean portrait piano key labels.
- 1.0.41 · Portrait piano live treble/bass notation and cleaner key labels; Perfect Pitch 12-note training filter.
- 1.0.40 · Individual premium styling for all six tools; piano now playable in portrait and landscape.
- 1.0.39 · Premium Music Toolbox home redesign with refreshed original E-and-sound logo.
- 1.0.38 · Faster warm audio note triggering for Synth and Drum Pads; removed extra pad scheduling offset.
- 1.0.32 · Genre-based beat generator, 16/32/64-step patterns and preset-aware synth macros.
- 1.0.31 · Drum Machine, 16-step sequencer, neon ripple visuals, expanded synth presets, macros and glide.
- 1.0.30 · Synth 2.0: 808 Destroyer, oscillator switches, interactive ADSR, modulation matrix, effects and live waveform.
- 1.0.29 · Improved synth key release handling.
- 1.0.28 · Erik’s Synth: Play and Sound Design, 6 presets, two oscillators, filter, ADSR and vibrato.
- 1.0.27 · Metronome with BPM, time signatures, beat accents and Tap Tempo.
- 1.0.26 · Refined Chromatic Tuner icon.
- 1.0.25 · Chromatic Tuner with microphone pitch detection; Grand Piano cache status; version information and changelog.
- 1.0.24 · Piano settings icon aligned with the home screen.
