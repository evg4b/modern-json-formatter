# Promo video and store screenshots

Launch video (`brag.mp4`, 27s, 1920×1080, sound effects only) and Chrome/Edge store screenshots (`screenshots/`, 1280×800), rendered from one animated HTML page.

## Build

Requirements: macOS (captions use the system font), Google Chrome (stable), `ffmpeg` on `PATH`, Node 20+.

```bash
cd brag-output/work
npm ci
npm run build      # video + screenshots
npm run video      # video only
npm run screens    # screenshots only
```

## Files

| File | What it is |
|---|---|
| `brag-plan.md` | Creative plan and storyboard (first version; scenes have since grown) |
| `share-copy.txt` | Post text for social |
| `work/index.html` | The video: every frame is `render(t)`, a pure function of time |
| `work/audio.mjs` | Synthesises the sound effects to `audio.wav`, timed to `index.html` |
| `work/build.mjs` | Copies assets from the repo, renders frames and screenshots in headless Chrome, encodes with ffmpeg |

To retime a scene, change the times in `index.html` and the matching cues in `audio.mjs`. Screenshot moments and the poster frame are set at the top of `build.mjs`.
