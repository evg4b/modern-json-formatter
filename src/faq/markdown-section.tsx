import { FC } from 'react';

export const MarkdownSection: FC<{ section: MarkdownFile }> = ({ section }) => (
  <section dangerouslySetInnerHTML={ { __html: section.html } }/>
);
