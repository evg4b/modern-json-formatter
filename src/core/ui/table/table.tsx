import { When } from '@core/ui';
import { clsx } from 'clsx';
import { Header } from './table-header';
import { Row } from './table-row';
import { empty, table, td } from './table.module.css';

export interface TableColumn {
  name: string;
  path: string;
}

interface TableProps<T> {
  readonly data: T[];
  readonly columns: TableColumn[],
}

export function Table<T>({ data, columns }: TableProps<T>) {
  return (
    <table className={ table }>
      <thead>
      <tr>
        { columns.map(col => <Header column={ col } key={ col.name }/>) }
      </tr>
      </thead>
      <tbody>
      <When condition={ data.length > 0 }>
        { data.map((item, index) => (
          <Row item={ item } columns={ columns } key={ index }/>
        )) }
      </When>
      <When condition={ data.length === 0 }>
        <tr>
          <td className={ clsx(empty, td) } colSpan={ columns.length }>
            No rows
          </td>
        </tr>
      </When>
      </tbody>
    </table>
  );
}
