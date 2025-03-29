import { clearHistory, DomainCountResponse, getDomains } from '@core/background';
import { useAsyncEffect } from '@core/hooks';
import { Button, Column, Logo, Row, Table, TableColumn } from '@core/ui';
import { ChromeWebStoreButton, GithubButton, KoFiButton } from '@core/ui/buttons';
import { useCallback, useState } from 'react';
import { container, header, logo, separator, title } from './options.module.css';

const columns: TableColumn[] = [
  { name: 'Domain', path: 'domain' },
  { name: 'Count', path: 'count' },
];

export const Options = () => {
  const [state, setState] = useState<DomainCountResponse>([]);

  const update = useCallback(
    async () => setState(await getDomains()),
    [setState, getDomains],
  );

  useAsyncEffect(async () => await update());

  const clear = useCallback(async () => {
    void clearHistory();
    await update();
  }, []);

  return (
    <Column className={ container }>
      <Row align="center" className={ title }>
        <Logo size="48" className={ logo }/>
        <h2>Modern JSON Formatter Options</h2>
      </Row>
      <Row>
        <GithubButton/>
        <ChromeWebStoreButton/>
        <KoFiButton/>
      </Row>
      <hr className={ separator }/>
      <Row align="center" justify="space-between" className={ header }>
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
