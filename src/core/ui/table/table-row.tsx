import { TableColumn } from '@core/ui';
import { get } from 'lodash';
import { td } from './table.module.css';

interface RowProps<T> {
  item: T;
  columns: TableColumn[];
}

export const Row = <T, >({ item, columns }: RowProps<T>) => (
  <tr>
    { columns.map(col => {
      return <td className={ td } key={col.name}>
        { get(item, col.path) }
      </td>;
    }) }
  </tr>
);
