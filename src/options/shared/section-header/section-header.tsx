import { Row } from '@core/ui';
import { FC, PropsWithChildren } from 'react';
import { headerContainer } from './section-header.module.css';

export interface SectionHeaderProps extends PropsWithChildren {
  header: string;
}

export const SectionHeader: FC<SectionHeaderProps> = ({ header, children }) => (
  <Row align="center" justify="space-between" className={ headerContainer }>
    <h2>{ header }</h2>
    <div>
      { children }
    </div>
  </Row>
);
