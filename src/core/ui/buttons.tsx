import { BUTTONS } from '@core/constants';
import { clsx } from 'clsx';
import { buttonLink } from './button.module.css';
import chromeWebStoreIcon from './chrome-web-store-button-icon.svg';
import githubIcon from './github-button-icon.svg';
import kofiIcon from './ko-fi-button-icon.svg';

interface ButtonProps {
  title: string;
  href: string;
  icon: string;
}

const factory = ({ icon, href, title }: ButtonProps) =>
  () => (
    <a target="_blank"
       href={ href }
       className={ clsx(buttonLink, 'button-link') }
       title={ title }
       dangerouslySetInnerHTML={ { __html: icon } }
    >
    </a>
  );

export const ChromeWebStoreButton = factory({
  icon: chromeWebStoreIcon,
  title: BUTTONS.CHROME_WEB_STORE.TITLE,
  href: BUTTONS.CHROME_WEB_STORE.URL,
});

export const GithubButton = factory({
  icon: githubIcon,
  title: BUTTONS.GITHUB.TITLE,
  href: BUTTONS.GITHUB.URL,
});

export const KoFiButton = factory({
  icon: kofiIcon,
  title: BUTTONS.KO_FI.TITLE,
  href: BUTTONS.KO_FI.URL,
});
