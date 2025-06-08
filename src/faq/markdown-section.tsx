import { FC, memo } from 'react';

export const MarkdownSection: FC<{ section: MarkdownFile }> = memo(({ section }) => (
  <section dangerouslySetInnerHTML={ { __html: section.html } }/>
));
