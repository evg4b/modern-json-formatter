import { BUTTONS } from '@core/constants';
import { clsx } from 'clsx';
import { buttonLink } from './button.module.css';
import chromeWebStoreIcon from './chrome-web-store-button-icon.svg';
import githubIcon from './github-button-icon.svg';
import kofiIcon from './ko-fi-button-icon.svg';

interface ButtonProps {
  title: string;
  href: string;
}

const factory = (icon: string, { href, title }: ButtonProps) => () => (
  <a target="_blank"
     href={ href }
     class={ clsx(buttonLink, 'button-link') }
     title={ title }
     dangerouslySetInnerHTML={ { __html: icon } }
  >
  </a>
);

export const ChromeWebStoreButton = factory(chromeWebStoreIcon, {
  title: BUTTONS.CHROME_WEB_STORE.TITLE,
  href: BUTTONS.CHROME_WEB_STORE.URL,
});

export const GithubButton = factory(githubIcon, {
  title: BUTTONS.GITHUB.TITLE,
  href: BUTTONS.GITHUB.URL,
});

export const KoFiButton = factory(kofiIcon, {
  title: BUTTONS.KO_FI.TITLE,
  href: BUTTONS.KO_FI.URL,
});
