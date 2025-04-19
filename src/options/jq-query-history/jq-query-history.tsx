import { clearHistory, DomainCountResponse, getDomains } from '@core/background';
import { useAsyncEffect } from '@core/hooks';
import { Button, Table, TableColumn } from '@core/ui';
import { useCallback, useState } from 'react';
import { SectionHeader } from '../shared';

const columns: TableColumn[] = [
  { name: 'Domain', path: 'domain' },
  { name: 'Count', path: 'count' },
];

export const JqQueryHistory = () => {
  const [state, setState] = useState<DomainCountResponse>([]);

  const update = useCallback(
    async () => setState(await getDomains()),
    [setState, getDomains],
  );

  useAsyncEffect(() => update());

  const clear = useCallback(() => {
    void clearHistory();
    void update();
  }, []);

  return (
    <>
      <SectionHeader header="JQ Query history data">
        <Button onClick={ clear }>
          Clear
        </Button>
      </SectionHeader>
      <Table
        data={ state }
        columns={ columns }
      />
    </>
  );
};
