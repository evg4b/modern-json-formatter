# Security Policy

## Supported Versions

We actively support the latest stable version of `modern-json-formatter`.
Older versions may not receive security updates.

## Reporting a Vulnerability

If you find a security issue, please report it
by [opening an issue on GitHub](https://github.com/evg4b/modern-json-formatter/issues) or contacting us directly.
We will review and address it as soon as possible.

## Privacy Policy

`modern-json-formatter` processes everything on your device and sends nothing to us or to anyone else.

- We do not collect any personal or sensitive data.
- The extension makes no network requests. A WebAssembly module bundled with the extension parses, formats, queries
  and hashes the JSON on your device.
- There is no analytics, telemetry or tracking.
- No data is shared with third parties, advertisers or external services.

The extension keeps two kinds of data in your browser:

- The jq queries you run successfully, grouped by site (the hostname, or the file path for local files), in the
  extension's IndexedDB. They feed the query autocomplete, and you can review and clear them on the options page.
- Your settings (toolbar buttons, download mode, size limit), in `chrome.storage.sync`. If browser sync is turned on,
  your browser syncs them across your devices through your browser account, as it does for other extensions.

If you have questions or concerns, open an issue on GitHub.

## Verifying Release Integrity

You can check that the extension installed from the Chrome Web Store or Microsoft Edge Add-ons store matches the
source code published in a release.

> **Why individual files, not the archive?**
> Chrome Web Store and Microsoft Edge Store repackage the extension into their own `.crx` format before distribution.
> The original `.zip` submitted to the store is not what end-users receive.
> Hashing that archive tells you nothing about what was installed.
>
> Instead, the release build computes a checksum for every individual file inside `dist/` before packaging, so you can
> check the files that were shipped regardless of how the store repackaged them.

### Step 1: get hashes from your installed extension

Find the version number of the installed extension on the `chrome://extensions` page, then run the command for your OS
to compute SHA256 hashes of all extension files.

The commands below use Chrome's default profile and the Chrome Web Store ID `dmofgolehdakghahlgibeaodbahpfkpf`. For
Microsoft Edge, use the Edge ID `edjgdbhdfdodmabofpnkngphlbpjpihj` and the Edge profile folder instead:
`%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Extensions` on Windows,
`~/Library/Application Support/Microsoft Edge/Default/Extensions` on macOS and
`~/.config/microsoft-edge/Default/Extensions` on Linux.

#### Windows

1. Open a PowerShell prompt.
2. Set the version variable, replacing `<VERSION>` with the installed version number:

```powershell
$env:VERSION = "<VERSION>"
```

3. Compute SHA256 hashes for all files in the extension folder:

```powershell
Get-ChildItem "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Extensions\dmofgolehdakghahlgibeaodbahpfkpf\$($env:VERSION)_0" -Recurse -File |
  Get-FileHash -Algorithm SHA256 |
  Select-Object Hash, @{Name="FileName"; Expression={Split-Path $_.Path -Leaf}} |
  Sort-Object FileName |
  Format-Table -AutoSize
```

#### macOS

1. Open Terminal.
2. Set the version variable, replacing `<VERSION>` with the installed version number:

```bash
export VERSION=<VERSION>
```

3. Compute SHA256 hashes for all files in the extension folder:

```bash
find "${HOME}/Library/Application Support/Google/Chrome/Default/Extensions/dmofgolehdakghahlgibeaodbahpfkpf/${VERSION}_0" \
  -type f -exec sh -c 'echo "$(shasum -a 256 "$1" | cut -d" " -f1)  $(basename "$1")"' _ {} \; | sort
```

#### Linux

1. Open Terminal.
2. Set the version variable, replacing `<VERSION>` with the installed version number:

```bash
export VERSION=<VERSION>
```

3. Compute SHA256 hashes for all files in the extension folder:

```bash
find "${HOME}/.config/google-chrome/Default/Extensions/dmofgolehdakghahlgibeaodbahpfkpf/${VERSION}_0" \
  -type f -exec sh -c 'echo "$(sha256sum "$1" | cut -d" " -f1)  $(basename "$1")"' _ {} \; | sort
```

> **Note:** Some files will not match, and that is expected:
>
> - `_metadata/verified_contents.json` and `_metadata/computed_hashes.json` are added by the browser at installation.
> - `.DS_Store` is created by macOS Finder.
> - `manifest.json` is rewritten by the stores when they publish the extension (for example, they add `update_url`).
>   The Edge package is also built from a manifest without the `key` field.
>
> Every other file must match.

### Step 2: compare against release checksums

1. Go to the [releases page](https://github.com/evg4b/modern-json-formatter/releases).
2. Select the version matching your installed extension.
3. Download `checksums.sha256.txt`.
4. Compare the hashes from Step 1 against the entries in `checksums.sha256.txt`.
   Every file present in both lists must have an identical hash.

## Verifying via Local Build

> **Note:** This section is for developers who want to reproduce the build from source and check the checksums
> themselves.

### Prerequisites

| Tool               | Purpose            | Install                                                                       |
|--------------------|--------------------|-------------------------------------------------------------------------------|
| **Node.js** (v24+) | JavaScript runtime | [nodejs.org](https://nodejs.org)                                              |
| **Yarn** (v4.13+)  | Package manager    | `corepack enable`                                                             |
| **Rust** (v1.85+)  | WASM core build    | [rust-lang.org](https://rust-lang.org/tools/install/)                         |
| `wasm-pack`        | WASM bindgen tool  | [wasm-bindgen.github.io](https://wasm-bindgen.github.io/wasm-pack/installer/) |
| **GNU Make**       | Build runner       | [gnu.org/software/make](https://www.gnu.org/software/make/)                   |
| `jq`, `zip`        | Packaging          | your package manager                                                          |

Check your setup:

```bash
node --version
yarn --version
rustc --version
wasm-pack --version
```

### Build and verify

1. Check out the tagged release commit you want to verify.
2. Run the full build:

```bash
make
```

This builds the WASM core and the extension, writes `checksums.sha256.txt` (SHA256 of every file in `dist/`) to the
project root, and packs `extention.zip` for Chrome and `extention-msdn.zip` for Edge. The checksums are taken before the
Edge package removes `key` from `dist/manifest.json`.

3. Compare those hashes against the ones from Step 1 and against `checksums.sha256.txt` from the release. Apart from
   the files listed in the note above, every file must match.
