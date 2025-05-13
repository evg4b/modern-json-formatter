import clsx from 'clsx';
import { useRef } from 'react';
import { sidebar } from './faq.module.css';
import { MarkdownSection } from './markdown-section';
import sections from './sections';
import { Sidebar } from './sidebar';

export const Faq = () => {
  const mainRef = useRef<HTMLElement>(null);

  return (
    <>
      <Sidebar className={ clsx(sidebar, `sidebar`) }
               mainRef={ mainRef }
      />
      <main ref={ mainRef }>
        <h1>JQ Queries Manual</h1>
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
    </>
  );
};
