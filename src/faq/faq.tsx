import 'preact/debug';
import text from './faq.html';
import { sidebar } from './faq.module.css';
import { Sidebar } from './sidebar';

export const Faq = () => (
  <>
    <Sidebar class={ `${ sidebar } sidebar` }/>
    <main
      dangerouslySetInnerHTML={ { __html: text } }
    />
  </>
);
