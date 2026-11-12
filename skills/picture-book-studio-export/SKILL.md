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
> **Self-Contained Bundled Engine**: All of the engine source code is bundled
> directly inside this plugin at `<plugin-root>/engine/`
> (`~/.gemini/config/plugins/animated_picture_book_studio/engine/`).
> - Run `python <plugin-root>/scripts/ensure_engine.py --workspace <workspace>`
>   to verify or automatically scaffold `<plugin-root>/engine/` into the active
>   `<workspace>` and install dependencies via `pnpm install`.
> - Alternatively, pass `--in-place` to run directly inside `<plugin-root>/engine`.
>
> This skill does NOT modify scene source files — it only resolves the engine
> workspace, starts the dev server, opens the browser, and orchestrates video
> export.

---

## Step 1 — Verify Build & Tests

Before starting the server, ensure the project compiles cleanly:

```bash
# Run from <workspace>
pnpm test
```

If tests pass, proceed. If there are compilation errors, fix them first
(using the `picture-book-agent-coder` agent or the `coder-agent`).

Alternatively, a lighter check:

```bash
pnpm run build
```

> [!NOTE]
> `pnpm run build` runs `tsc && vite build` → output in `<workspace>/dist/`.
> Tests use Vitest in Node environment (`<workspace>/tests/`).

---

## Step 2 — Start the Vite Dev Server

Start the dev server as a **background daemon** so it stays running for
the duration of the session:

```
run_command:
  CommandLine: pnpm run dev
  WorkingDirectory: <workspace>
  IsDaemon: true
  WaitMsBeforeAsync: 3000
```

The server starts on **http://localhost:5173**.

> [!TIP]
> Always leave the dev server running! The user can click the link to:
> - Scrub through the animation timeline
> - Toggle layers (crayon filter, paper texture, progressive fill)
> - Audition SFX via the audition bar
> - Inspect asset catalog and node telemetry
> - Manually download videos via the ⬇ button

### URL Parameters

| Parameter              | Example                              | Effect                                  |
|------------------------|--------------------------------------|-----------------------------------------|
| `?scene=<id>`          | `?scene=short-sample-1`             | Select any scene by registry key or id  |
| `?short_sample=<n>`    | `?short_sample=1`                   | Select scene 1, 2, or 3 (legacy)        |
| `?footage=<actId>`     | `?footage=act-3-nightfall`          | Loop a single act                       |
| `?t=<sec>`             | `?t=12.5`                           | Seek to timestamp                       |
| `?autoplay=1`          | `?autoplay=1`                       | Auto-play on load                       |
| `?vibrant=1`           | `?vibrant=1`                        | Force vibrant crayon mode               |
| `?auto_export=1`       | `?auto_export=1&resolution=1080p`   | Auto-start video export on page load    |
| `?resolution=<preset>` | `?resolution=720p`                  | Export resolution (default: 1080p)      |

### Scene Registry Quick-Reference

| URL                       | Scene                                          | Duration |
|---------------------------|-------------------------------------------------|----------|
| `?short_sample=1`         | SHORT_SAMPLE_1 (Sun & Moon story)              | 30 s     |
| `?short_sample=2`         | MOONLIGHT_STORY (Lune Store + Ochre Cottage)   | 28 s     |
| `?short_sample=3`         | MEADOW_PARTY (Strawberry's Birthday, vibrant)  | 24 s     |

Custom scenes registered in `SCENE_REGISTRY` can be loaded with
`?scene=<sceneId>`.

---

## Step 3 — Automated Video Export

### Option A: URL-Triggered Auto-Export (Recommended)

Navigate a browser to the auto-export URL. Use the Chrome DevTools plugin
or a `browser` subagent:

```
http://localhost:5173/?scene=<sceneId>&auto_export=1&resolution=1080p
```

Or for legacy scene selection:

```
http://localhost:5173/?short_sample=1&auto_export=1&resolution=1080p
```

The page will automatically begin the video export pipeline on load.

### Option B: Button-Click Export

Navigate to the scene URL and programmatically click the download button:

```js
// Via Chrome DevTools evaluate_script or browser subagent:
document.querySelector('#btn-download-video').click();
```

### Waiting for Export Completion

Poll `document.body.dataset.exportState` until it equals `'done'`:

```js
// Export states: 'exporting' → 'done' (success) or 'error' (failure)
document.body.dataset.exportState  // 'done' when complete
document.body.dataset.exportFilename  // e.g. 'picture-book-short-sample-1-1080p-16x9.mp4'
document.body.dataset.exportSavedPath  // e.g. '<workspace>/exports/picture-book-short-sample-1-1080p-16x9.mp4'
```

Alternatively, wait for the download button text to change:
- **During export**: `Exporting...` or shows a percentage
- **When done**: `⬇ Download 16:9 Video`

### Where the File is Saved

The studio does **two things** when export completes:

1. **Browser download** — triggers `<a download>` to the user's Downloads folder.
2. **Server save** — POSTs the MP4 blob to `/__studio/save-export` on the
   Vite dev server, which writes it to:
   ```
   <workspace>/exports/<filename>.mp4
   ```

> [!NOTE]
> The `/__studio/save-export` endpoint is a Vite dev-server middleware.
> It sanitises the filename and writes the raw MP4 bytes to the `exports/`
> directory. The saved path is returned as JSON:
> `{ ok: true, savedPath: "<workspace>/exports/..." }`.

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

## Step 4 — Deliver the Final Video

Once export is complete, provide the user with:

### 1. Direct file link to the exported MP4

```markdown
Here's your finished video:
[picture-book-short-sample-1-1080p-16x9.mp4](file:///<workspace>/exports/picture-book-short-sample-1-1080p-16x9.mp4)
```

> [!TIP]
> Always use the `file:///` scheme with forward slashes for clickable
> links in the Antigravity chat.

### 2. Live interactive studio link

```markdown
You can also watch and interact with your animation live:
http://localhost:5173/?scene=short-sample-1&autoplay=1
```

Leave the dev server running so the user can click this link.

### 3. Verify the file exists

```bash
# Check the exports directory
Get-ChildItem ./exports/
```

If the user requested a specific output path, copy the file:

```bash
Copy-Item "./exports/picture-book-short-sample-1-1080p-16x9.mp4" "C:\Users\user\Desktop\my-video.mp4"
```

---

## Full Agent Workflow — Cheat Sheet

```
1. pnpm test                              # verify build in <workspace>
2. pnpm run dev  (IsDaemon: true)          # start Vite on :5173
3. Browser → localhost:5173/?scene=<id>&auto_export=1&resolution=1080p
4. Wait for document.body.dataset.exportState === 'done'
5. Verify <workspace>/exports/<filename>.mp4 exists
6. Reply with [filename.mp4](file:///<workspace>/exports/filename.mp4)
   + live link http://localhost:5173/?scene=<id>&autoplay=1
```

> [!CAUTION]
> Do **not** stop the Vite dev server after export. The user may want to
> continue previewing, tweaking, or exporting additional scenes. Only
> stop it if the user explicitly asks.

---

## Troubleshooting

| Problem                              | Solution                                       |
|--------------------------------------|-------------------------------------------------|
| `pnpm test` fails                    | Fix compilation errors before starting server   |
| Port 5173 in use                     | Kill the old process or use `--port 5174`       |
| Export hangs at "Exporting..."       | Check browser console for WebCodecs errors      |
| No file in `exports/`               | Ensure `/__studio/save-export` middleware is present in `vite.config.ts` |
| `exportState` is `'error'`          | Check `document.body.dataset.exportError` for details |
| MP4 has no audio                     | Ensure `soundEngine` is passed to `exportSceneTo16x9Video` and `audioClips` files exist in `public/audio/` |
| Browser download but no server save  | Only works with `pnpm run dev` (Vite dev middleware), not production build |

---

## Filename Convention

Exported files follow this pattern:

```
picture-book-<sceneId>[-<footageId>]-<resolution>-16x9.mp4
```

Examples:
- `picture-book-short-sample-1-1080p-16x9.mp4`
- `picture-book-meadow-party-act-3-720p-16x9.mp4`
