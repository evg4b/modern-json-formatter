import { Content } from './content';
import './faq.module.css';
import { Sidebar, SidebarProvider } from './sidebar';

export const Faq = () => {
  return (
    <SidebarProvider>
      <Sidebar/>
      <Content />
    </SidebarProvider>
  );
};
