import 'preact/debug';
import { ChromeWebStoreButton, GithubButton, KoFiButton } from '@core/ui/buttons';
import { Column, Row } from '@core/ui/flex';
import { Logo } from '@core/ui/logo';
import { render } from 'preact';
import { conainer } from './options.module.css';

const OptionsPage = () => (
  <Column class={ conainer }>
    <Row class="d-flx flx-row flx-center">
      <Column>
        <Logo size="48"/>
      </Column>
      <h1>Modern JSON Formatter Options</h1>
    </Row>
    <Row>
      <GithubButton href="#" title="kldfjsdlkfj"/>
      <ChromeWebStoreButton href="#" title="kldfjsdlkfj"/>
      <KoFiButton href="#" title="kldfjsdlkfj"/>
    </Row>
  </Column>
);

render(<OptionsPage/>, document.body);

