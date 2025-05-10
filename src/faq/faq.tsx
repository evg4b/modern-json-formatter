import { useEffect } from 'react';
import { sidebar } from './faq.module.css';
import { MarkdownSection } from './markdown-section';
import sections from './sections';
import { Sidebar } from './sidebar';

export const Faq = () => {
  useEffect(() => {
    const sections: NodeListOf<HTMLElement> = document.querySelectorAll('main section');
    const links: NodeListOf<HTMLAnchorElement> = document.querySelectorAll('a.item');

    const sectionsMap = new Map<string, HTMLElement>();
    sections.forEach(section => sectionsMap.set(`#${ section.id }`, section));

    const linksMap = new Map<string, HTMLAnchorElement>();
    links.forEach(link => linksMap.set(link.hash, link));

    const scrollToSection = (anchor: HTMLAnchorElement) => {
      const section = sectionsMap.get(anchor.hash);
      section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleClick: EventListener = e => {
      e.preventDefault();
      if (e.target) {
        const target = e.target as HTMLElement;
        if (target instanceof HTMLAnchorElement) {
          scrollToSection(target);
        } else if (target.parentElement instanceof HTMLAnchorElement) {
          scrollToSection(target.parentElement);
        }
      }
    };

    links.forEach(link => {
      link.addEventListener('click', handleClick);
    });

    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;
      sections.forEach(section => {
        const top = section.offsetTop;
        const bottom = top + section.offsetHeight;
        const link = linksMap.get(`#${ section.id }`);
        if (link) {
          if (scrollPosition >= top && scrollPosition <= bottom) {
            link.classList.add('active');
            if (!link.classList.contains('section-header')) {
              link.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'nearest',
              });
            }
          } else {
            link.classList.remove('active');
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);

    handleScroll();

    return () => {
      links.forEach(link => {
        link.removeEventListener('click', handleClick);
      });
      window.removeEventListener('scroll', handleScroll);
    };
  })

  return (
    <>
      <Sidebar className={ `${ sidebar } sidebar` }/>
      <main>
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
