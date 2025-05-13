import { ChromeWebStoreButton, GithubButton, KoFiButton } from '@core/ui/buttons';
import { Column, Row } from '@core/ui/flex';
import { Logo } from '@core/ui/logo';
import { clsx } from 'clsx';
import { FC, memo, RefObject, useEffect, useState } from 'react';
import { SidebarLink } from './sidebar-link';
import { logo } from './sidebar.module.css';

export interface NavigationItem {
  id: string;
  title: string;
  children?: NavigationItem[];
  ref: HTMLElement;
}

interface SidebarProps {
  className?: string;
  mainRef: RefObject<HTMLElement | null>;
}

export const Sidebar: FC<SidebarProps> = memo(({ className, mainRef }) => {
  const [navigation, setNavigation] = useState<NavigationItem[]>([]);

  useEffect(() => {
    const sections = mainRef.current?.querySelectorAll('section');
    const navigationItems = Array.from(sections ?? [])
      .flatMap<NavigationItem>(section => {
        const header = section.querySelector('h2');
        if (!header) {
          return [];
        }

        return {
          id: header.id,
          title: header.innerHTML,
          ref: header,
          children: Array.from(section.querySelectorAll('h3'))
            .map<NavigationItem>(subHeader => ({
              id: subHeader.id,
              title: subHeader.innerHTML,
              ref: subHeader,
            })),
        } satisfies NavigationItem;
      });

    console.log(navigationItems);

    setNavigation(navigationItems);
  }, [mainRef]);

  useEffect(() => {
    const handleScroll = () => {
      console.log('scroll');
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [navigation])

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
            <SidebarLink item={ item }
                         mainRef={ mainRef }
                         className="item section-header"
            />
            <div className="children section">
              { item.children?.map((child) => (
                <SidebarLink key={ child.id }
                             item={ child }
                             mainRef={ mainRef }
                             className="item"
                />
              )) }
            </div>
          </div>
        )) }
      </div>
    </div>
  );
});
