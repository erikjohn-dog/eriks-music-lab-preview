# Perfect Pitch Trainer

Version **1.0.0**. A complete, dependency-free iPhone PWA built with HTML, CSS, and vanilla JavaScript. It generates pure sine waves with the Web Audio API. No audio downloads, app accounts, ads, subscriptions, tracking, or external APIs.

**Intended address:** https://erikjohn-dog.github.io/perfect-pitch-trainer/

The app files are complete. This delivery does not mean they have already been uploaded or deployed to GitHub. Use the steps below. You do not need a Mac, Apple Developer account, App Store submission, command line, or programming tools.

## 1. Get the files on your Windows PC

1. Download `Perfect-Pitch-Trainer.zip` from the delivery message.
2. In File Explorer, right-click the ZIP and choose **Extract All…**, then **Extract**.
3. Open the extracted folder. You should see `index.html`, `app.js`, `styles.css`, `manifest.webmanifest`, and an `icons` folder directly inside it.
4. Read `START-HERE.txt` if you prefer plain-text instructions.

Do not upload the ZIP itself. Do not use a double-clicked local `index.html` as your installed app: JavaScript modules and service workers need a website address with HTTPS, or a local development server.

## 2. Upload to your EXISTING repository

1. In a browser on Windows, sign in to GitHub and open:
   https://github.com/erikjohn-dog/perfect-pitch-trainer
2. On the **Code** tab, ensure the branch selector says **main**.
3. Choose **Add file → Upload files**.
4. From the extracted folder, drag its **contents** onto the upload page. Include the `icons` folder, preserving that folder's name. Do **not** drag the enclosing extracted folder; that would put the app one directory too deep.
5. Review the upload list. It should include `index.html` at the root and `icons/icon-192.png`, `icons/icon-512.png`, `icons/icon-maskable-512.png`, and `icons/apple-touch-icon.png`.
6. Enter a commit message such as **Install Perfect Pitch Trainer 1.0.0**.
7. Select **Commit directly to the main branch**, if offered, and click **Commit changes**. If a branch rule requires a pull request, use GitHub's proposed-changes flow and merge it into `main` instead.

Only replace matching app files. Leave unrelated repository files alone. Do not create another repository or change visibility. The ZIP contains only this project, documentation, icons, and tests.

The included `.nojekyll` file is empty and tells GitHub to publish plain static files. If your upload did not include it, choose **Add file → Create new file**, name it `.nojekyll`, leave it empty, and commit it to `main`. This app uses no Jekyll-specific files, but including it makes the hosting intent explicit.

The `tests` folder and documentation can also be uploaded; they do not run in the app. No build or package installation is necessary. All files are far below GitHub's browser upload limits.

## 3. Check deployment

1. Open the repository's **Actions** tab.
2. Find the latest **pages build and deployment** run. Wait until it completes with a green check. If it fails, open the run to see the failed step.
3. Open **Settings → Pages**. Keep your existing configuration: **Deploy from a branch**, branch **main**, folder **/ (root)**, HTTPS enabled.
4. Open https://erikjohn-dog.github.io/perfect-pitch-trainer/ in your browser. If the deployment is still running, wait and refresh after it finishes.
5. Confirm the title is **Perfect Pitch**, twelve note buttons appear, and **Play Note** produces a tone after you click it.

An app account is never required. Your existing GitHub account is used only to host the files. GitHub Pages on GitHub Free supports public repositories; do not purchase a plan for this project. This delivery does not change your repository's visibility or hosting settings.

## 4. Open on iPhone

1. Connect your iPhone to the internet.
2. Open **Safari** and enter the exact website address above, including `/perfect-pitch-trainer/`.
3. Turn the volume down initially, then tap **Play Note** and adjust the volume comfortably.
4. Wait for the bottom of the screen to say **Ready for offline use**.

Every first tone is initiated by a tap. The app never starts audio simply because the page opens. Headphones are recommended for low notes: the generated pitch stays correct even when an iPhone speaker cannot reproduce it clearly.

## 5. Add to Home Screen

1. In Safari, open the **Share** menu. Depending on your Safari layout, it may be inside the More menu.
2. Scroll the share sheet and tap **Add to Home Screen**.
3. Keep **Open as Web App** enabled if this option appears.
4. Tap **Add**.
5. Open the new **Perfect Pitch** icon on your Home Screen while you are still online.
6. Wait for **Ready for offline use** inside the installed app too.

The installed web app and a Safari tab may have separate local storage on some iOS versions. Make your lasting settings inside the Home Screen app. The same installation process works on iPad, with screen-specific menu placement.

## 6. Verify offline use

1. In the installed app, first confirm **Ready for offline use**.
2. Turn on Airplane Mode. Turn off Wi-Fi as well, since Airplane Mode can leave Wi-Fi enabled.
3. Close the app, then launch it again from its Home Screen icon.
4. Tap **Play Note**, answer, replay, and move to the next question.
5. Open Settings, change a theme or duration, save, close, and reopen. The setting should remain.
6. Turn the internet back on afterward so future app updates can be found.

If the app will not reopen offline, return online, open it from the Home Screen, and wait for the readiness status again. Browser storage can be evicted under device storage pressure; offline caching is not a guarantee against the operating system deleting website data.

## 7. Use the trainer

- Tap **Play Note**, listen, then choose C, C♯, D, D♯, E, F, F♯, G, G♯, A, A♯, or B.
- **Play Again** always replays the same note. It adds no attempts and changes no scores.
- Octave does not affect grading: C1 through C7 all count as C.
- After answering, the note buttons lock. Read the result and tap **Next Note** when ready.
- The **gear** opens all settings. Save settings to apply changes. Closing without saving discards edits.
- Minimum and maximum notes are independently selectable from C1 through C7. Both endpoints are included. Invalid reversed ranges cannot be saved.
- Duration choices are 0.5, 1, 2, or 4 seconds, including the short fades.
- **Blind training** hides correctness, note names, accuracy, and streaks until the last question. Choose 10, 20, or 50 questions. Results appear automatically after the final answer.
- **Detailed session results** controls the question-by-question table in session results.
- **Reference** plays only when you tap the separate reference button. Its note is clearly named. It never plays automatically and does not count as an answer.
- **Play note when tapping Next** enables autoplay only when you explicitly tap Next. It does not automatically advance after an answer.
- **Avoid consecutive exact repeats** excludes only the exact previous note, when the range has more than one note. Different octaves of the same pitch class can still occur.
- **Finish session** ends normal practice and shows a session summary. Blind sessions end at their selected length.

Changing training settings during an active session asks whether to start fresh. Cancelling preserves the current question; applying clears the in-memory session but leaves already collected statistics. Appearance or collection changes preserve the question. Closing/reloading the app clears unfinished session answers; saved settings and collected statistics remain.

## 8. Statistics and privacy

Collection and all statistic views are off by default. In **Settings → Statistics**, turn on **Collect statistics** to save future attempts. Independently choose which views to show, save settings, reopen Settings, then tap **View statistics**. The score on the main screen is an optional in-memory normal-session score and can work without permanent collection.

Saved data includes overall counts, per-pitch-class counts, current and longest streaks, and a 12 × 12 confusion matrix. The mobile matrix view lets you choose an actual note and inspect counts; an expandable full table can be swiped sideways. Completed-session history is optional and limited to the latest 100 entries.

Turning collection on later never adds previous answers. History is saved only if every answer in that session was collected, and both collection and **Save completed session history** are on at completion. Partially uncollected sessions are skipped. Turning collection off preserves previous records and resets the current persistent streak. Blind-session results always work in memory, even with collection off.

Reset overall, per-note, streak, matrix, or history data independently, or reset all statistics. Every reset asks for confirmation. Independent resets do not rewrite other categories, so their totals may differ afterward. Settings are not erased by a statistics reset. Access to saved-statistic views is blocked during an active blind session.

Settings and statistics are stored in versioned localStorage on this device. Session details are not uploaded, and there are no analytics or external runtime requests. When online, GitHub receives ordinary requests for the public app files. There is no device syncing. Clearing website data, removing the app, using private browsing, or device storage cleanup may lose preferences, progress, and cached app files. If storage is blocked or full, an on-screen warning appears and the current visit still works in memory.

## 9. Update later

1. Get an updated project ZIP and extract it.
2. Upload the changed files to the **same repository's main branch**, using the same root folder structure.
3. For every change to any cached app file, the developer must change `VERSION` in `service-worker.js` (for example, `1.0.0` to `1.0.1`). The release should also update the visible About version and documentation. This is already set for the initial release.
4. Wait for the successful Pages deployment.
5. Open the installed app while online. Returning to the app or restoring internet access triggers an update check.
6. When **Update available** appears, finish your current session and tap it. Confirm the restart. The new version activates and reloads. Saved preferences and statistics are preserved.

A missing cached file prevents the replacement worker from installing, so a previously cached version remains usable. Updates never force-reload a running training question. If GitHub still serves an older deployment, wait for the deployment to finish and reopen the app online. Do not clear website data just to update; that would erase progress.

## 10. Troubleshooting

| Problem | What to do |
| --- | --- |
| No sound | Tap Play Note yourself; raise media volume gradually; check Silent Mode, mute settings, Bluetooth/headphone routing, and other audio apps. Bring the app to the foreground and tap again. If interrupted by a call or Siri, a new tap resumes the context. Close/reopen if needed. |
| Very low notes are weak or inaudible | Use headphones or raise the minimum note to C3. The app does not move low notes into another octave. |
| Answer buttons are disabled | First play the unknown training note. Playing only a reference note does not unlock answers. After submitting, tap Next Note. |
| Cannot hear a difference between octaves | The task asks for pitch class only; octave is intentionally ignored when grading. |
| No Add to Home Screen option | Open the site in Safari itself, rather than an in-app browser. Open Share and scroll the options. Update iOS if needed. |
| A GitHub page or 404 appears | Use the `github.io` app address, not the `github.com` repository address. Confirm root `index.html`, main/root Pages settings, and a green Pages deployment. |
| Blank screen or missing icons | Check that `app.js`, `core.js`, `audio.js`, `storage.js`, `styles.css`, and all four PNG icons were uploaded at the listed paths. Check capitalization. |
| “Preparing offline access…” persists | Keep the app open online. Confirm all required files were uploaded. Offline mode needs HTTPS and service-worker support; private or restricted browsing may prevent caching. |
| Settings do not survive reopening | Check the storage warning, avoid private browsing, and use the same installed app rather than switching to a Safari tab. |
| An old version appears | Finish Pages deployment, reopen online, and accept Update available. A changed release must increment the worker version. |
| Note range cannot be saved | Choose a maximum note that is equal to or higher than the minimum note. |

## 11. Quality assurance and remaining manual checks

See `TESTING.md` for exactly what was run and what was not. **27 automated tests pass** using Node's built-in test runner, with no test dependencies. Audio, UI, and service-worker tests use doubles rather than a real browser. No physical iPhone, actual Safari session, real audio output, Home Screen installation, browser-rendered layout, or live GitHub deployment was verified in the delivery environment.

Optional developer test command, run from the project folder with a recent Node.js version:

```sh
node --test tests/*.test.mjs
```

Your first iPhone verification should cover real audible output, replay interruption, background cleanup, the smallest-screen layout, theme and reduced-motion behavior, Home Screen installation, offline cold launch, persistence, and one full blind session.

## Project files

| File | Purpose |
| --- | --- |
| `index.html` | Accessible training screen, dialogs, Apple metadata |
| `styles.css` | Responsive layout, safe areas, themes, reduced-motion behavior |
| `core.js` | Musical math, randomization, grading, statistics logic |
| `audio.js` | One-voice Web Audio engine with fades and cleanup |
| `storage.js` | Versioned, validated, failure-tolerant local persistence |
| `app.js` | UI state, settings, session flow, statistics, update notifications |
| `manifest.webmanifest` | Installable identity, start URL, icons, standalone mode |
| `service-worker.js` | Versioned, atomic app-shell cache and approved updates |
| `icons/` | Actual 180-, 192-, and 512-pixel PNG icons plus SVG source |
| `.nojekyll` | Plain static GitHub Pages hosting |
| `tests/` | Automated logic and simulated-interaction tests |
| `TESTING.md` | Test evidence and manual acceptance checklist |

## Official instructions consulted

- Apple: https://support.apple.com/en-lamr/guide/iphone/iphea86e5236/ios
- GitHub file uploads: https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository
- GitHub Pages: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

Released under the included MIT license.
