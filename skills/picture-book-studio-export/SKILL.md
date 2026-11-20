---
name: picture-book-studio-export
description: >-
  Start the Picture-Book Studio dev server, preview animations in the browser,
  and export / download .mp4 video files for the user. Covers build verification,
  Vite dev server management, automated browser-based video export, and
  delivering the final video file to the user.
---

# Picture-Book Studio — Dev Server, Preview & Video Export

This skill is a **turnkey runbook** for Antigravity agents to give users a
seamless preview-and-export experience with the Picture-Book Crayon Video
Engine.

> [!IMPORTANT]
> Resolve `<workspace>` first via `agy-node "<plugin-root>/scripts/ensure_engine.mjs" --workspace "<workspace>"` (see `rules/AGENTS.md` for standalone `agy-node` bootstrap and Option A scratch-workspace details). This skill does **not** modify scene source files — it verifies builds, exports `.mp4`, starts `:5173`, and handles asset promotion.

---

## Step 1 — Verify Build & Tests

Before starting the server, ensure the project compiles cleanly using the bundled zero-dependency CLI via `agy-node`:

```bash
# Run from <workspace>
agy-node scripts/studio-cli.mjs test
```

If tests pass, proceed. If there are compilation errors, fix them first before exporting.

Alternatively, run strict typechecking and production build:

```bash
agy-node scripts/studio-cli.mjs typecheck
agy-node scripts/studio-cli.mjs build
```

> [!NOTE]
> `agy-node scripts/studio-cli.mjs build` runs the bundled `vendor/typescript` compiler and bundles `<workspace>/dist/` with zero external dependencies.
> Tests run via the bundled `vendor/vitest-shim` in Node environment (`<workspace>/tests/`).

---

## Step 2 — Direct CLI Video Export (Primary Method — No Browser UI or Button Clicks Required)

Export the `.mp4` directly from the terminal using `studio-cli.mjs export`:

```bash
agy-node scripts/studio-cli.mjs export --scene <sceneId> --resolution 1080p
```

Optional flags:
- `--scene <sceneId>` — Scene ID or registry key (e.g. `1`, `2`, `3`, `strawberry-beach-birthday`, `knight-dragon-quest`, `moonlit-garden`)
- `--resolution 1080p|720p` — Output resolution (default: `1080p`)
- `--footage <actId>` — Export a single story act
- `--vibrant 1|0` — Override vibrant mode

### How CLI Export Works
1. Starts an ephemeral local Studio server in-process.
2. Automatically locates an installed Chromium/Edge browser binary on the OS (e.g., Windows's built-in `msedge.exe`, so **Google Chrome does NOT need to be installed**) and spawns it in invisible `--headless=new` mode.
3. Renders all stepped 6 FPS SVG frames, mixes procedural `audioCues` and file-based `audioClips` via `OfflineAudioContext`, encodes H.264 + AAC via `WebCodecs` + `mp4-muxer`, writes `<workspace>/exports/<filename>.mp4` to disk, and prints the saved path and clickable `file:///` link directly to stdout.

---

## Step 3 — Launch (or Attempt to Launch) the Live Studio Dev Server

Even after exporting via the CLI, **always attempt to start the Studio dev server** as a background daemon so the user can interactively inspect and play their animation in the browser:

```
run_command:
  CommandLine: agy-node scripts/studio-cli.mjs dev
  WorkingDirectory: <workspace>
  IsDaemon: true
  WaitMsBeforeAsync: 3000
```

The server starts on **http://localhost:5173**.

- **If the dev server starts cleanly**: Keep it running, tell the user that the video has been exported, provide the clickable `[<filename>.mp4](file:///<workspace>/exports/<filename>.mp4)` link, **and** give them the live site URL (`http://localhost:5173/?scene=<sceneId>&autoplay=1`) so they can go check it out.
- **If the dev server cannot be started** (e.g., port conflict or environment restriction): Tell the user that the video has been exported (with the clickable `[<filename>.mp4](file:///<workspace>/exports/<filename>.mp4)` link) and inform them that the live preview server could not be set up.

### URL Parameters (Live Studio Preview)

| Parameter              | Example                              | Effect                                  |
|------------------------|--------------------------------------|-----------------------------------------|
| `?scene=<id>`          | `?scene=short-sample-1`             | Select any scene by registry key or id  |
| `?short_sample=<n>`    | `?short_sample=1`                   | Select scene 1–6 (legacy)               |
| `?footage=<actId>`     | `?footage=act-3-nightfall`          | Loop a single act                       |
| `?t=<sec>`             | `?t=12.5`                           | Seek to timestamp                       |
| `?autoplay=1`          | `?autoplay=1`                       | Auto-play on load                       |
| `?vibrant=1`           | `?vibrant=1`                        | Force vibrant crayon mode               |
| `?book_frame=1|0`      | `?book_frame=1`                     | Toggle Storybook Cover Opening & Ending/Credits Book-Frame (`#chk-book-frame`, default `1`) |
| `?auto_export=1`       | `?auto_export=1&resolution=1080p`   | Auto-start video export on page load    |
| `?resolution=<preset>` | `?resolution=720p`                  | Export resolution (default: 1080p)      |

### Scene Registry Quick-Reference

| URL                                   | Scene                                          | Duration |
|---------------------------------------|-------------------------------------------------|----------|
| `?short_sample=1`                     | SHORT_SAMPLE_1 (Sun & Moon story)              | 30 s     |
| `?short_sample=2`                     | MOONLIGHT_STORY (Lune Store + Ochre Cottage)   | 28 s     |
| `?short_sample=3`                     | MEADOW_PARTY (Strawberry's Birthday, vibrant)  | 24 s     |
| `?scene=corner-store-day`             | CORNER_STORE_DAY (Daytime Lune Store)          | 32 s     |
| `?scene=moonlit-garden`               | MOONLIT_GARDEN (Cat in Moonlit Garden)         | 30 s     |
| `?scene=strawberry-beach-birthday`    | STRAWBERRY_BEACH_BIRTHDAY (Beach Splash)       | 46 s     |
| `?scene=knight-dragon-quest`          | KNIGHT_DRAGON_QUEST (Sir Leo & Barnaby Dragon) | 66 s     |

Custom scenes registered in `SCENE_REGISTRY` can be loaded with
`?scene=<sceneId>`.

---

## Fallback — Browser Subagent Export (Only if CLI Export Cannot Find an OS Browser Binary)

If `studio-cli.mjs export` reports that no headless browser binary was found on disk, fall back to the built-in `browser` subagent against the running dev server (`http://localhost:5173/?scene=<sceneId>&auto_export=1&resolution=1080p`) and wait until `document.body.dataset.exportState === 'done'`.

### Export Pipeline Details

The engine uses two export strategies (auto-selected):

| Strategy                         | When Used                              | Output Format |
|----------------------------------|----------------------------------------|---------------|
| **WebCodecs + mp4-muxer**        | Chrome 94+ / Edge (has `VideoEncoder`) | Non-fragmented MP4, H.264 + AAC, `fastStart: 'in-memory'`, full seek tables |
| **MediaRecorder fallback**       | Older browsers                         | Fragmented MP4/WebM, duration-patched via `patchMp4Duration()` |

Both strategies mix **procedural `audioCues`** and **file-based `audioClips`**
into the final audio track via `renderOfflineAudio()`.

**Resolution presets:**

| Preset | Dimensions  | Video Bitrate | Codec           |
|--------|-------------|---------------|-----------------|
| 1080p  | 1920 × 1080 | 8 Mbps        | `avc1.420028`   |
| 720p   | 1280 × 720  | 5 Mbps        | `avc1.42001f`   |

Audio: AAC 128 kbps stereo, 48 kHz sample rate.
Container FPS: 30 (renders only on stepped 6 FPS ticks).

---

## Step 4 — Deliver the Final Video & Preview Link

Once export is complete:

1. **Direct clickable link to the exported MP4**:
   ```markdown
   Here is your exported video:
   [picture-book-short-sample-1-1080p-16x9.mp4](file:///<workspace>/exports/picture-book-short-sample-1-1080p-16x9.mp4)
   ```
2. **Live interactive Studio URL (or fallback notice)**:
   - If `agy-node scripts/studio-cli.mjs dev` is running:
     ```markdown
     You can also watch and inspect your animation live in the Studio:
     http://localhost:5173/?scene=<sceneId>&autoplay=1
     ```
   - If `agy-node scripts/studio-cli.mjs dev` could not be started, inform the user that the live preview server couldn't be started, while still providing the exported `.mp4` link above.
3. **Ask the user if they want to promote new assets to the main plugin folder**:
   - Whenever new characters, props, buildings, audio/SFX, or scenes were created in `<workspace>` (such as a per-conversation `scratch/picture-book-studio` workspace), ask the user if they want to move/save those assets into the main plugin folder (`<plugin-root>/engine/`) so they are available in future instances.
   - If the user confirms, run:
     ```bash
     agy-node "<plugin-root>/scripts/ensure_engine.mjs" --promote-from "<workspace>"
     ```

---

## Full Agent Workflow — Cheat Sheet

```
1. agy-node scripts/studio-cli.mjs test                                  # verify build & tests in <workspace>
2. agy-node scripts/studio-cli.mjs export --scene <id> --resolution 1080p # direct headless CLI export to exports/<filename>.mp4
3. agy-node scripts/studio-cli.mjs dev (IsDaemon: true)                  # launch (or attempt to launch) live dev server on :5173
4. Reply with:
   - [filename.mp4](file:///<workspace>/exports/filename.mp4)
   - Live site URL http://localhost:5173/?scene=<id>&autoplay=1 (or note if dev server couldn't be started)
```

> [!CAUTION]
> Do **not** stop the Studio dev server after export. The user may want to
> continue previewing, tweaking, or exporting additional scenes. Only
> stop it if the user explicitly asks.

---

## Troubleshooting

| Problem                              | Solution                                       |
|--------------------------------------|-------------------------------------------------|
| `studio-cli.mjs test` fails          | Fix compilation errors before starting server   |
| Port 5173 in use                     | Kill the old process or pass `--port 5174`      |
| Export hangs at "Exporting..."       | Check browser console for WebCodecs errors      |
| No file in `exports/`               | Ensure `/__studio/save-export` endpoint is active on the dev server |
| `exportState` is `'error'`          | Check `document.body.dataset.exportError` for details |
| MP4 has no audio                     | Ensure `soundEngine` is passed to `exportSceneTo16x9Video` and `audioClips` files exist in `public/audio/` |
| Browser download but no server save  | Ensure the dev server (`agy-node scripts/studio-cli.mjs dev`) is running |

---

## Filename Convention

Exported files follow this pattern:

```
picture-book-<sceneId>[-<footageId>]-<resolution>-16x9.mp4
```

Examples:
- `picture-book-short-sample-1-1080p-16x9.mp4`
- `picture-book-meadow-party-act-3-720p-16x9.mp4`
