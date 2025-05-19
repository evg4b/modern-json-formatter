import clsx from 'clsx';
import { Content } from './Content';
import { sidebar } from './faq.module.css';
import { Sidebar } from './sidebar';
import { SidebarProvider } from './sidebar/sidebar.context';

export const Faq = () => {
  return (
    <SidebarProvider>
      <Sidebar className={ clsx(sidebar, `sidebar`) }/>
      <Content />
    </SidebarProvider>
  );
};
