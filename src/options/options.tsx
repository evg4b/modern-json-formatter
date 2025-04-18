import { Column, Logo, Row } from '@core/ui';
import { ChromeWebStoreButton, GithubButton, KoFiButton } from '@core/ui/buttons';
import { ColorSchemeEditor } from './color-scheme';
import { Footer } from './footer';
import { JqQueryHistory } from './jq-query-history';
import { container, logo, title, separator } from './options.module.css';
import { Section } from './shared/section/section';

export const Options = () => {
  return (
    <Column className={ container }>
      <Column>
        <Row align="center" className={ title }>
          <Logo size="48" className={ logo }/>
          <h2>Modern JSON Formatter Options</h2>
        </Row>
        <Row justify="center">
          <GithubButton/>
          <ChromeWebStoreButton/>
          <KoFiButton/>
        </Row>
      </Column>
      <hr className={ separator } />
      <Section>
        <ColorSchemeEditor/>
      </Section>
      <Section>
        <JqQueryHistory/>
      </Section>
      <Footer />
    </Column>
  );
};
