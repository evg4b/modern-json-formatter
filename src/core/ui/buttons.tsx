import chromeWebStoreIcon from './chrome-web-store-button-icon.svg';
import githubIcon from './github-button-icon.svg';
import kofiIcon from './ko-fi-button-icon.svg';
import test from './button.module.css';
console.log(test);

export interface ButtonProps {
  title: string;
  href: string;
}

const factory = (icon: string) => {
  const innerHtml = { __html: icon };

  return ({ href, title }: ButtonProps) => (
    <div>
      <a target="_blank"
         href={ href }
         title={ title }
         dangerouslySetInnerHTML={ innerHtml }
      />
    </div>
  );
};

export const GithubButton = factory(githubIcon);
export const ChromeWebStoreButton = factory(chromeWebStoreIcon);
export const KoFiButton = factory(kofiIcon);

