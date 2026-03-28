# Security Policy

## Supported Versions

We actively support the latest stable version of `modern-json-formatter`.
Older versions may not receive security updates.

## Reporting a Vulnerability

If you find a security issue, please report it
by [opening an issue on GitHub](https://github.com/evg4b/modern-json-formatter/issues) or contacting us directly.
We will review and address it as soon as possible.

## Privacy Policy

We take user privacy seriously and ensure that `modern-json-formatter` operates in a secure and privacy-respecting
manner.

- **No Data Collection** – We do not collect, store, or process any personal or sensitive user data.
- **No Data Transmission** – We do not send any data over the internet, ensuring that your information remains private.
- **No Analytics or Tracking** – We do not use tracking mechanisms, telemetry, or analytics to monitor user activity.
- **Local Processing Only** – All JSON formatting is performed locally on your device, without any remote processing.
- **No Third-Party Sharing** – We do not share any data with third parties, advertisers, or external services.

Your privacy and security are our top priorities. If you have any questions or concerns, feel free to contact us.

## Verifying Release Integrity

This guide explains how to verify that the extension installed from the Chrome Web Store or Microsoft Edge Store
matches the source code published in a release.

> **Why individual files, not the archive?**
> Chrome Web Store and Microsoft Edge Store repackage the extension into their own `.crx` format before distribution.
> The original `.zip` submitted to the store is not what end-users receive.
> Hashing that archive is therefore meaningless for integrity verification.
>
> Instead, checksums are computed for **every individual file inside `dist/`** before packaging.
> This lets you verify the exact source files that were shipped, regardless of how the browser vendor repackaged them.

### Step 1 - Get hashes from your installed extension

First, determine the version number of the installed extension (visible on the `chrome://extensions` page),
then run the appropriate command for your OS to compute SHA256 hashes of all extension files.

#### Windows

1. Open a PowerShell prompt.
2. Set the version variable - replace `<VERSION>` with the installed version number:

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
2. Set the version variable - replace `<VERSION>` with the installed version number:

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
2. Set the version variable - replace `<VERSION>` with the installed version number:

```bash
export VERSION=<VERSION>
```

3. Compute SHA256 hashes for all files in the extension folder:

```bash
find "${HOME}/.config/google-chrome/Default/Extensions/dmofgolehdakghahlgibeaodbahpfkpf/${VERSION}_0" \
  -type f -exec sh -c 'echo "$(shasum -a 256 "$1" | cut -d" " -f1)  $(basename "$1")"' _ {} \; | sort
```

> **Note:** The files `.DS_Store`, `verified_contents.json`, and `computed_hashes.json` are added by Chrome after
> installation and are not part of the original extension package. Ignore them when comparing hashes.

### Step 2 - Compare against release checksums

1. Go to the [releases page](https://github.com/evg4b/modern-json-formatter/releases).
2. Select the version matching your installed extension.
3. Download `checksums.sha256.txt`.
4. Compare the hashes from Step 1 against the entries in `checksums.sha256.txt`.
   Every file present in both lists must have an identical hash.

## Verifying via Local Build

> **Note:** This section is for developers who want to independently reproduce the build and verify checksums
> from source.

### Prerequisites

| Tool               | Purpose            | Install                                                                       |
|--------------------|--------------------|-------------------------------------------------------------------------------|
| **Node.js** (v24+) | JavaScript runtime | [nodejs.org](https://nodejs.org)                                              |
| **Yarn** (v4.13+)  | Package manager    | `corepack enable`                                                             |
| **Rust** (v1.60+)  | WASM core build    | [rust-lang.org](https://rust-lang.org/tools/install/)                         |
| `wasm-pack`        | WASM bindgen tool  | [wasm-bindgen.github.io](https://wasm-bindgen.github.io/wasm-pack/installer/) |
| **GNU Make**       | Build runner       | [gnu.org/software/make](https://www.gnu.org/software/make/)                   |

Verify your setup:

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

This produces `checksums.sha256.txt` in the project root containing SHA256 hashes for every file in `dist/`.

3. Compare those hashes against the ones from Step 1 of the installed extension verification above.
   Every file must match.
