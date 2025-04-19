import { footerContainer } from './footer.module.css';

export const Footer = () => {
  return (
    <footer className={ footerContainer }>
      <div>
        <a href="https://chromewebstore.google.com/detail/modern-json-formatter/dmofgolehdakghahlgibeaodbahpfkpf" target="_blank" rel="noopener noreferrer">
          Modern JSON Formatter { chrome.runtime.getManifest().version }
        </a>
      </div>
      <div>
        Author:
        <a href="https://github.com/evg4b" target="_blank" rel="noopener noreferrer">
          Evgeny Abramovich
        </a>
      </div>
    </footer>
  );
};
