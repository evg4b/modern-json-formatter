# /brag plan — Modern JSON Formatter v2.1.0

**What:** A Chrome/Edge extension that turns raw JSON responses into a fast, readable, collapsible view, with a jq query bar built in.
**For:** Developers who open API endpoints and `.json` files in the browser.
**Sets it apart:** Big numbers stay exact (no `18446744073709552000`), key order is guaranteed, full jq runs in a Rust/WASM core.
**Most impressive claim:** `18446744073709551615` survives intact. Chrome's own `JSON.parse` can't do that.
**Visual hook:** A wall of minified JSON snaps into the formatter's dark view.
**Real UI shown:** The formatted tree (the real `.object/.key/.string/.number/.toggle` markup and the `variables.scss` palette), the Query/Formatted/Raw toolbar, the jq input, collapse into `{ ... }  // 4 properties`.
**Tone:** default. Punchy and clean, dev-to-dev.
**Share caption:** Your browser rounds big numbers. This doesn't.

## Visual identity
- Background #282828, keys #7dadf9, strings #5dd9ff, numbers/booleans #9f84ff, meta #717171, active button #1c466e / #a3c6dd
- Monaco (bundled `assets/Monaco.woff`) for code, system sans for captions
- Logo: lilac flower J inside braces (`.github/readme-logo.png`)

## Storyboard (20.0s, 1920×1080, 30fps)
| # | Time | Scene | On-screen text |
|---|---|---|---|
| 1 | 0.0–3.0 | **Hook.** Browser window filled with a minified JSON wall. Cursor hovers. | "Your API just answered." |
| 2 | 3.0–6.0 | **Reveal.** Wall collapses and the formatted tree cascades in line by line, toolbar slides in. | "Now it's readable." |
| 3 | 6.0–10.0 | **Big numbers.** Zoom on `"max uint64": 18446744073709551615`; ghost of `JSON.parse` value `18446744073709552000` struck through beside it. | "Big numbers stay exact." |
| 4 | 10.0–14.0 | **jq.** Click Query, type `.[] \| {id, title}`, results swap in. | "Query it with jq." |
| 5 | 14.0–16.8 | **Fold.** Toggles rotate, objects fold into `{ ... }  // 4 properties` one by one. | "Fold anything. Keys stay in order." |
| 6 | 16.8–20.0 | **Outro.** Logo pops, name, "Free for Chrome & Edge". | "Modern JSON Formatter" / "Free for Chrome & Edge" |

## Sound
Node-synthesised track at 120 BPM in A minor: soft pad, pluck arpeggio, light kick from the reveal on. Effects use the same scale: a filtered whoosh into the reveal, soft key ticks while typing, and a chord chime on the logo. Everything sits under the music.
