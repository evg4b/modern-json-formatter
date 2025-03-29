import { TableColumn } from '@core/ui';
import { th } from './table.module.css';

interface HeaderProps {
  column: TableColumn;
}

export const Header = ({ column }: HeaderProps) => (
  <th className={ th }>
    { column.name }
  </th>
);
