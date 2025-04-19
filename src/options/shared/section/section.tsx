import { type FC, type PropsWithChildren } from 'react';
import { sectionContainer } from './section.module.css';

export const Section: FC<PropsWithChildren> = ({ children }) => (
  <div className={sectionContainer}>
    { children }
  </div>
);

