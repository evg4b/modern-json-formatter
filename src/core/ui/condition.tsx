import { FC, PropsWithChildren } from 'react';

export const When: FC<PropsWithChildren<{ condition: boolean }>> = ({ children, condition }) => (
  condition && children
);
