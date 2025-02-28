import { clsx } from 'clsx';
import { get } from 'lodash';
import { empty, table, td, th } from './table.module.css';

export interface TableColumn {
  name: string;
  path: string;
}

interface TableProps<T> {
  data: T[];
  columns: TableColumn[],
}

export function Table<T>({ data, columns }: TableProps<T>) {
  return (
    <table className={ table }>
      <thead>
      <tr>
        { columns.map(col => (
          <th className={ th }>{ col.name }</th>
        )) }
      </tr>
      </thead>
      <tbody>
      { data.length ? (
        data.map(item => (
          <tr>
            { columns.map(col => (
              <td className={ td }>{ get(item, col.path) }</td>
            )) }
          </tr>
        ))
      ) : (
        <tr>
          <td className={ clsx(empty, td) } colSpan={ columns.length }>
            No rows
          </td>
        </tr>
      ) }
      </tbody>
    </table>
  );
}
