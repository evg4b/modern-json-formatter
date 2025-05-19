import { memo } from 'react';
import { content } from './content.module.css';
import { MarkdownSection } from './markdown-section';
import sections from './sections';
import { useSidebar } from './sidebar';

export const Content = memo(() => {
  const { contentRef } = useSidebar();

  return (
    <main ref={ contentRef } className={ content }>
      <MarkdownSection section={ sections.en.intro }/>
      <MarkdownSection section={ sections.en.basicFilters }/>
      <MarkdownSection section={ sections.en.typesAndValues }/>
      <MarkdownSection section={ sections.en.builtinOperatorsAndFunctions }/>
      <MarkdownSection section={ sections.en.conditionalsAndComparisons }/>
      <MarkdownSection section={ sections.en.regularExpressions }/>
      <MarkdownSection section={ sections.en.advancedFeatures }/>
      <MarkdownSection section={ sections.en.math }/>
      <MarkdownSection section={ sections.en.assignment }/>
    </main>
  );
});
