<p align="center">
  <a href="https://github.com/evg4b/modern-json-formatter" title="Modern JSON Formatter">
    <img alt="Modern JSON Formatter" width="30%" src=".github/readme-logo.png">
  </a>
</p>
<h1 align="center">Modern JSON Formatter</h1>
<p align="center">
  Format JSON in a modern way. With guaranteed order of keys, big numbers, jq queries, expandable/collapsable properties and more. 
</p>
<p align="center">
  <a href="https://github.com/evg4b/modern-json-formatter/actions/workflows/ci.yml?query=branch%3Amain">
    <img
      alt="GitHub Actions Workflow Status"
      src="https://img.shields.io/github/actions/workflow/status/evg4b/modern-json-formatter/ci.yml?branch=main&logo=github"
    />
  </a>
  <a href="https://github.com/evg4b/modern-json-formatter/blob/main/LICENSE">
    <img
      alt="License"
      src="https://img.shields.io/github/license/evg4b/modern-json-formatter?logo=github"
    />
  </a>
  <a href="https://github.com/evg4b/modern-json-formatter/releases/latest">
    <img
      src="https://img.shields.io/github/v/release/evg4b/modern-json-formatter?logo=github"
      alt="GitHub Release Version"
    />
  </a>
  <br>
  <a href="https://sonarcloud.io/project/overview?id=evg4b_modern-json-formatter">
    <img
      alt="Quality Gate Status"
      src="https://sonarcloud.io/api/project_badges/measure?project=evg4b_modern-json-formatter&metric=alert_status"
    />    
  </a>
  <a href="https://sonarcloud.io/project/activity?graph=coverage&id=evg4b_modern-json-formatter">
    <img
      alt="Coverage"
      src="https://sonarcloud.io/api/project_badges/measure?project=evg4b_modern-json-formatter&metric=coverage" 
    />
  </a>
  <a href="https://sonarcloud.io/summary/new_code?id=evg4b_modern-json-formatter">
    <img
      alt="Security Rating"
      src="https://sonarcloud.io/api/project_badges/measure?project=evg4b_modern-json-formatter&metric=security_rating"
    />
  </a>
  <a href="https://sonarcloud.io/summary/new_code?id=evg4b_modern-json-formatter">
    <img
      alt="Lines of Code" 
      src="https://sonarcloud.io/api/project_badges/measure?project=evg4b_modern-json-formatter&metric=ncloc" 
    />
  </a>
</p>

# Features

- Fast parsing and formatting in a Rust core compiled to WebAssembly
- Numbers shown exactly as written, so integers and decimals too large for JavaScript keep every digit
- Keys kept in the order the server sent them, duplicated keys included
- Expand and collapse any object or array; a collapsed node shows how many properties or items it holds
- Formatted and Raw views of the response
- [jq](https://jqlang.org) queries on the current document, run by the [jaq](https://github.com/01mf02/jaq) engine and
  extended with `md5`, `sha256` and `sha512`
- Query history per site, offered as autocomplete in the query input
- A built-in jq manual whose examples run in place
- Download the document as received, formatted or minified
- URLs and email addresses inside strings open with Ctrl+click (⌘+click on macOS)
- Selecting and copying gives valid JSON: toggles and counters stay out of the copied text
- Tolerates comments, trailing commas, `NaN` and `Infinity` in the document
- Works on JSON served as plain text and on local `file://` pages (enable "Allow access to file URLs" for the extension)
- Files over a size limit (10 MB by default) are formatted as plain text instead of an interactive tree
- Light and dark themes that follow the system setting
- Settings for the toolbar buttons, the download button's behaviour and the size limit, plus a page to review or clear
  the query history

# Installation

<table align="center">
  <tbody>
    <tr>
      <td>
        <a href="https://chromewebstore.google.com/detail/modern-json-formatter/dmofgolehdakghahlgibeaodbahpfkpf">
          <img src="./.github/chrome-web-store.png" width="160px" alt="Available in the Chrome Web Store">
        </a>
      </td>
      <td>
        <a href="https://chromewebstore.google.com/detail/dmofgolehdakghahlgibeaodbahpfkpf">
          <img
            alt="Chrome Web Store Version" 
            src="https://img.shields.io/chrome-web-store/v/dmofgolehdakghahlgibeaodbahpfkpf?logoColor=%23fff&color=blue&label=version"
          />
        </a>
      </td>
      <td>
        <a href="https://chromewebstore.google.com/detail/dmofgolehdakghahlgibeaodbahpfkpf">
          <img
            alt="Chrome Web Store Rating"
            src="https://img.shields.io/chrome-web-store/rating/dmofgolehdakghahlgibeaodbahpfkpf?logoColor=%23fff&color=blue"
          />
        </a>
      </td>
      <td>
        <a href="https://chromewebstore.google.com/detail/dmofgolehdakghahlgibeaodbahpfkpf">
          <img
            alt="Chrome Web Store Users"
            src="https://img.shields.io/chrome-web-store/users/dmofgolehdakghahlgibeaodbahpfkpf?logoColor=%23fff&color=blue"
          />
        </a>
      </td>
    </tr>
    <tr>
      <td>
        <a href="https://microsoftedge.microsoft.com/addons/detail/modern-json-formatter/edjgdbhdfdodmabofpnkngphlbpjpihj">
          <img src="./.github/microsoft-store.png" width="160px" alt="Available in Microsoft Store">
        </a>
      </td>
      <td>
        <a href="https://microsoftedge.microsoft.com/addons/detail/modern-json-formatter/edjgdbhdfdodmabofpnkngphlbpjpihj">
          <img
            alt="Microsoft Store" 
            src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Fedjgdbhdfdodmabofpnkngphlbpjpihj%3Fhl%3Dru-RU%26gl%3DCA&query=version&prefix=v&label=version&color=blue"
          />    
        </a>
      </td>
      <td>
        <a href="https://microsoftedge.microsoft.com/addons/detail/modern-json-formatter/edjgdbhdfdodmabofpnkngphlbpjpihj">
          <img
            alt="Microsoft Store Rating"
            src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Fedjgdbhdfdodmabofpnkngphlbpjpihj%3Fhl%3Dru-RU%26gl%3DCA&query=averageRating&label=rating&suffix=/5&color=blue"
          />
        </a>
      </td>
      <td>
        <a href="https://microsoftedge.microsoft.com/addons/detail/modern-json-formatter/edjgdbhdfdodmabofpnkngphlbpjpihj">
          <img
            alt="Microsoft Store Users"
            src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Fedjgdbhdfdodmabofpnkngphlbpjpihj%3Fhl%3Dru-RU%26gl%3DCA&query=activeInstallCount&label=users"
          />
        </a>
      </td>
    </tr>
  </tbody>
</table>

Alternatively, you can install the extension manually from
[the release page](https://github.com/evg4b/modern-json-formatter/releases/latest).

# Browser compatibility

|                                                                                                                                                                                      | Browser name   | Support |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------|---------|
| <a title="Google Chrome" href="https://www.google.com/chrome"><img src="https://www.google.com/chrome/static/images/chrome-logo.svg" width="30px"></a>                              | Google Chrome  | ✅       |
| <a title="Chromium" href="https://www.chromium.org"><img src="https://upload.wikimedia.org/wikipedia/commons/2/28/Chromium_Logo.svg" width="30px"></a>                              | Chromium       | ✅       |
| <a title="Microsoft Edge" href="https://www.microsoft.com/edge"><img src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Microsoft_Edge_logo_%282019%29.png" width="30px"></a> | Microsoft Edge | ✅       |
| <a title="Yandex Browser" href="https://browser.yandex.ru"><img src="https://upload.wikimedia.org/wikipedia/commons/8/80/Yandex_Browser_logo.svg" width="30px"></a>                 | Yandex Browser | ✅       |
| <a title="Opera" href="https://www.opera.com/"><img src="https://upload.wikimedia.org/wikipedia/commons/4/49/Opera_2015_icon.svg" width="30px"></a>                                 | Opera          | ✅       |
| <a title="Brave" href="https://brave.com/"><img src="https://upload.wikimedia.org/wikipedia/commons/5/51/Brave_icon_lionface.png" width="30px"></a>                                 | Brave          | ✅       |
| <a title="Arc" href="https://arc.net"><img src="https://upload.wikimedia.org/wikipedia/commons/3/37/Arc_%28browser%29_logo.svg" width="30px"></a>                                   | Arc Browser    | ✅       |

If your browser is not in the list, try installing the extension anyway. If it doesn't work,
[request support for it](<https://github.com/evg4b/modern-json-formatter/issues/new?title=Browser%20support%20request&body=%23%20Browser%20Support%20Request%0A%0ABrowser%20Details%3A%0A-%20Name%3A%20____%20%5Be.g.%2C%20Firefox%5D%0A-%20Version%20*(optional)*%3A%20____%20%5Be.g.%2C%20114.0%5D%0A-%20Platform%20*(optional)*%3A%20____%20%5Be.g.%2C%20Windows%5D%0A%0AAdditional%20Info%3A%0A-%20Link%20to%20the%20browser%20website%3A%20____>).

# Support the project

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/X8X0SWTP3)
