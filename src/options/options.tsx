import { clearHistory, DomainCountResponse, getDomains } from '@core/background';
import { BUTTONS } from '@core/constants';
import { useAsyncEffect } from '@core/hooks';
import { Button, Table, TableColumn } from '@core/ui';
import { ChromeWebStoreButton, GithubButton, KoFiButton } from '@core/ui/buttons';
import { Column, Row } from '@core/ui/flex';
import { Logo } from '@core/ui/logo';
import { useCallback, useState } from 'preact/hooks';
import { container, header, logo, separator, title } from './options.module.css';

const columns: TableColumn[] = [
  { name: 'Domain', path: 'domain' },
  { name: 'Count', path: 'count' },
];

export const Options = () => {
  const [state, setState] = useState<DomainCountResponse>([]);

  useAsyncEffect(async () => {
    setState(await getDomains());
  });

  const clear = useCallback(() => {
    void clearHistory();
    setState([]);
  }, []);

  return (
    <Column class={ container }>
      <Row align="center" class={ title }>
        <Logo size="48" class={ logo }/>
        <h2>Modern JSON Formatter Options</h2>
      </Row>
      <Row>
        <GithubButton
          href={ BUTTONS.GITHUB.URL }
          title={ BUTTONS.GITHUB.TITLE }
        />
        <ChromeWebStoreButton
          href={ BUTTONS.CHROME_WEB_STORE.URL }
          title={ BUTTONS.CHROME_WEB_STORE.TITLE }
        />
        <KoFiButton
          href={ BUTTONS.KO_FI.URL }
          title={ BUTTONS.KO_FI.TITLE }
        />
      </Row>
      <hr class={ separator }/>
      <Row align="center" justify="space-between" class={ header }>
        <h2>Query history data</h2>
        <Button onClick={ clear }>
          Clear
        </Button>
      </Row>
      <Table
        data={ state }
        columns={ columns }
      />
    </Column>
  );
};
