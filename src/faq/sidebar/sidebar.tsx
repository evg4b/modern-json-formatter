import { ChromeWebStoreButton, GithubButton, KoFiButton } from '@core/ui/buttons';
import { Column, Row } from '@core/ui/flex';
import { Logo } from '@core/ui/logo';
import { clsx } from 'clsx';
import { FC, memo } from 'react';
import { SidebarLink } from './sidebar-link';
import { useSidebar } from './sidebar.context';
import { logo } from './sidebar.module.css';


interface SidebarProps {
  className?: string;
}

export const Sidebar: FC<SidebarProps> = memo(({ className }) => {
  const { navigation } = useSidebar();

  return (
    <div className={ clsx('sidebar', className) }>
      <div className="header">
        <Column align="center">
          <Logo size="128" className={ logo }/>
          <div className="name">
            Modern JSON Formatter
          </div>
        </Column>
        <Row className="links" justify="center">
          <GithubButton/>
          <ChromeWebStoreButton/>
          <KoFiButton/>
        </Row>
      </div>
      <div className="menu">
        { navigation.map((item) => (
          <div key={ item.id } className="section">
            <SidebarLink item={ item }/>
            <div className="children section">
              { item.children?.map((child) => (
                <SidebarLink key={ child.id } item={ child } child/>
              )) }
            </div>
          </div>
        )) }
      </div>
    </div>
  );
});
