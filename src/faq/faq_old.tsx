import { Content } from './content';
import './faq.module.css';
import { Sidebar, SidebarProvider } from './sidebar';

export const Faq_old = () => {
  return (
    <SidebarProvider>
      <Sidebar/>
      <Content />
    </SidebarProvider>
  );
};
