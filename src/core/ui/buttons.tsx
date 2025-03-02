import { clsx } from 'clsx';
import chromeWebStoreIcon from './chrome-web-store-button-icon.svg';
import githubIcon from './github-button-icon.svg';
import kofiIcon from './ko-fi-button-icon.svg';
import { buttonLink } from './button.module.css';

export interface ButtonProps {
  title: string;
  href: string;
}

const factory = (icon: string) => {
  const innerHtml = { __html: icon };

  return ({ href, title }: ButtonProps) => (
    <a target="_blank"
       href={ href }
       class={ clsx(buttonLink, 'button-link') }
       title={ title }
       dangerouslySetInnerHTML={ innerHtml }
    >
    </a>
  );
};

export const GithubButton = factory(githubIcon);
export const ChromeWebStoreButton = factory(chromeWebStoreIcon);
export const KoFiButton = factory(kofiIcon);

