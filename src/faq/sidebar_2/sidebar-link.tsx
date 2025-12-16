import { isInViewport } from '@core/helpers';
import { clsx } from 'clsx';
import { FC, memo, type MouseEvent, useEffect, useRef } from 'react';
import { type NavigationItem } from './models';
import { activeLink, childLink, link } from './sidebar-link.module.css';
import { useSidebar } from './sidebar.context';

interface SidebarLinkProps {
  item: NavigationItem;
  child?: boolean;
}

export const SidebarLink: FC<SidebarLinkProps> = memo(({ item, child = false }) => {
  const { activeId, selectItem } = useSidebar();
  const ref = useRef<HTMLAnchorElement>(null);

  const isActive = activeId === item.id;

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    selectItem(item);
  };

  useEffect(() => {
    if (isActive && ref.current && !isInViewport(ref.current)) {
      ref.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      })
    }
  }, [isActive]);

  return (
    <a href="#"
       onClick={ handleClick }
       title={ item.title }
       className={ clsx(link, { [activeLink]: isActive, [childLink]: child }) }
       dangerouslySetInnerHTML={ { __html: item.titleHtml } }
       ref={ ref }
    />
  );
});
