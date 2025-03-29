import { FunctionComponent } from 'preact';

export const When: FunctionComponent<{ condition: boolean }> = ({ children, condition }) => (
  condition && children
);
